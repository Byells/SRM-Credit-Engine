import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { Transacao } from "../entities/transacao.entity";

@Service()
export class TransacaoRepository {
  async salvar(
    manager: EntityManager,
    transacao: Partial<Transacao>,
  ): Promise<Transacao> {
    const entity = manager.create(Transacao, transacao);
    return manager.save(entity);
  }
}
