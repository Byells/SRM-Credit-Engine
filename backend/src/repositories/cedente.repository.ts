import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { Cedente } from "../entities/cedente.entity";

@Service()
export class CedenteRepository {
  async buscarPorId(
    manager: EntityManager,
    id: number,
  ): Promise<Cedente | null> {
    return manager.findOne(Cedente, {
      where: { id },
    });
  }

  async listarTodos(manager: EntityManager): Promise<Cedente[]> {
    return manager.find(Cedente);
  }
}
