import { Service, Inject } from "typedi";
import { DataSource } from "typeorm";
import { CedenteRepository } from "../repositories/cedente.repository";
import { TipoRecebivelRepository } from "../repositories/tipoRecebivel.repository";
import { TaxaBaseRepository } from "../repositories/taxaBase.repository";
import { TransacaoRepository } from "../repositories/transacao.repository";
import { CurrencyExchangeService } from "./currencyExchange.service";
import { AuditoriaService } from "./auditoria.service";
import { PricingStrategyResolver } from "../strategies/pricing/pricingStrategyResolver";
import { CriarTransacaoDTO } from "../dtos/transacao/criarTransacao.dto";
import { NotFoundError } from "../errors/notFound.error";
import { BusinessRuleError } from "../errors/businessRuler.error";
import { StatusTransacao } from "../enums/statusTransacao.enum";
import { TAXA_BASE_REFERENCIAL } from "../constants/taxaBase.constant";

@Service()
export class TransacaoService {
  constructor(
    @Inject("dataSource") private dataSource: DataSource,
    private cedenteRepository: CedenteRepository,
    private tipoRecebivelRepository: TipoRecebivelRepository,
    private taxaBaseRepository: TaxaBaseRepository,
    private transacaoRepository: TransacaoRepository,
    private currencyService: CurrencyExchangeService,
    private auditoriaService: AuditoriaService,
    private strategyResolver: PricingStrategyResolver,
  ) {}

  async criar(input: CriarTransacaoDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cedente = await this.cedenteRepository.buscarPorId(
        queryRunner.manager,
        input.cedenteId,
      );
      if (!cedente) throw new NotFoundError("Cedente não encontrado");

      const produto = await this.tipoRecebivelRepository.buscarPorId(
        queryRunner.manager,
        input.produtoId,
      );
      if (!produto) throw new NotFoundError("Tipo de recebível não encontrado");

      const taxaBase = await this.taxaBaseRepository.buscarTaxaBase(
        queryRunner.manager,
        TAXA_BASE_REFERENCIAL,
      );
      if (!taxaBase)
        throw new NotFoundError("Taxa base vigente não encontrada");

      const strategy = this.strategyResolver.resolver(produto.nome);
      const { valorPresente } = strategy.calcular({
        valorFace: input.valorFace,
        taxaBase: taxaBase.valor,
        spread: produto.spread,
        prazoMeses: input.prazoMeses,
      });

      const { valorConvertido, fatorAplicado } =
        await this.currencyService.aplicarConversaoSeNecessario(
          queryRunner.manager,
          valorPresente,
          input.moedaTituloId,
          input.moedaPagamentoId,
        );

      const hash = this.auditoriaService.gerarHash({
        cedenteId: input.cedenteId,
        valorFace: input.valorFace,
        valorLiquido: valorConvertido,
        taxaBaseAplicada: taxaBase.valor,
        spreadAplicado: produto.spread,
        fatorCambioAplicado: fatorAplicado,
        prazoMeses: input.prazoMeses,
      });

      const transacao = await this.transacaoRepository.salvar(
        queryRunner.manager,
        {
          cedenteId: input.cedenteId,
          produtoId: input.produtoId,
          moedaTituloId: input.moedaTituloId,
          moedaPagamentoId: input.moedaPagamentoId,
          valorFace: input.valorFace,
          valorLiquido: valorConvertido,
          taxaBaseAplicada: taxaBase.valor,
          spreadAplicado: produto.spread,
          fatorCambioAplicado: fatorAplicado,
          prazoMeses: input.prazoMeses,
          dataTransacao: new Date(),
          hashAuditoria: hash,
        },
      );

      await queryRunner.commitTransaction();
      return transacao;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async liquidar(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock pessimista na linha: impede que duas liquidações concorrentes
      // da mesma transação sejam processadas ao mesmo tempo (race condition).
      const transacao = await this.transacaoRepository.buscarPorIdComLock(
        queryRunner.manager,
        id,
      );
      if (!transacao) throw new NotFoundError("Transação não encontrada");

      if (transacao.status !== StatusTransacao.PENDENTE) {
        throw new BusinessRuleError(
          `Transação não pode ser liquidada: status atual é ${transacao.status}`,
        );
      }

      const transacaoLiquidada = await this.transacaoRepository.atualizarStatus(
        queryRunner.manager,
        id,
        StatusTransacao.LIQUIDADA,
        new Date(),
      );

      await queryRunner.commitTransaction();
      return transacaoLiquidada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
