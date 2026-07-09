import { Service } from "typedi";
import { TaxaCambioRepository } from "../repositories/taxaCambio.repository";
import { converterMoeda } from "./currencyConverter.service";
import { EntityManager } from "typeorm";
import { NotFoundError } from "../errors/notFound.error";

@Service()
export class CurrencyExchangeService {
  constructor(private taxaCambioRepo: TaxaCambioRepository) {}

  async aplicarConversaoSeNecessario(
    manager: EntityManager,
    valor: string,
    moedaOrigemId: number,
    moedaDestinoId: number,
  ): Promise<{ valorConvertido: string; fatorAplicado: string }> {
    const FATOR_MESMA_MOEDA: string = "1.000000";
    if (moedaOrigemId === moedaDestinoId) {
      return { valorConvertido: valor, fatorAplicado: FATOR_MESMA_MOEDA };
    }

    const taxa = await this.taxaCambioRepo.buscarTaxaCambio(
      manager,
      moedaOrigemId,
      moedaDestinoId,
    );
    if (!taxa) {
      throw new NotFoundError(
        `Taxa de câmbio não encontrada para o par de moedas informado`,
      );
    }

    return {
      valorConvertido: converterMoeda(valor, taxa.valorTaxa),
      fatorAplicado: taxa.valorTaxa,
    };
  }
}
