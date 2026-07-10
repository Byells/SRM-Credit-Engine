import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { Transacao } from "../entities/transacao.entity";
import { StatusTransacao } from "../enums/statusTransacao.enum";

@Service()
export class TransacaoRepository {
  async salvar(
    manager: EntityManager,
    transacao: Partial<Transacao>,
  ): Promise<Transacao> {
    const entity = manager.create(Transacao, transacao);
    return manager.save(entity);
  }

  async buscarPorIdComLock(
    manager: EntityManager,
    id: number,
  ): Promise<Transacao | null> {
    return manager.findOne(Transacao, {
      where: { id },
      lock: { mode: "pessimistic_write" },
    });
  }

  async atualizarStatus(
    manager: EntityManager,
    id: number,
    status: StatusTransacao,
    dataLiquidacao: Date,
  ): Promise<Transacao> {
    await manager.update(Transacao, { id }, { status, dataLiquidacao });
    const atualizada = await manager.findOne(Transacao, { where: { id } });
    return atualizada as Transacao;
  }
}
