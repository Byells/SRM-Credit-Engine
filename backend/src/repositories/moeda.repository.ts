import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { Moeda } from "../entities/moeda.entity";

@Service()
export class MoedaRepository {
  async buscarPorId(manager: EntityManager, id: number): Promise<Moeda | null> {
    return manager.findOne(Moeda, { where: { id } });
  }

  async listarTodas(manager: EntityManager): Promise<Moeda[]> {
    return manager.find(Moeda);
  }
}
