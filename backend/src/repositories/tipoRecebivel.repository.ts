import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { TipoRecebivel } from "../entities/tipoRecebivel.entity";

@Service()
export class TipoRecebivelRepository {
  async buscarPorId(
    manager: EntityManager,
    id: number,
  ): Promise<TipoRecebivel | null> {
    return manager.findOne(TipoRecebivel, { where: { id } });
  }

  async listarTodos(manager: EntityManager): Promise<TipoRecebivel[]> {
    return manager.find(TipoRecebivel);
  }
}
