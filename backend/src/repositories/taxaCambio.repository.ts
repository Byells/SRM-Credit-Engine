import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { TaxaCambio } from "../entities/taxaCambio.entity";

@Service()
export class TaxaCambioRepository {
  async buscarTaxaCambio(
    manager: EntityManager,
    moedaOrigemId: number,
    moedaDestinoId: number,
  ): Promise<TaxaCambio | null> {
    return manager.findOne(TaxaCambio, {
      where: { moedaOrigemId, moedaDestinoId },
      order: { dataTaxa: "DESC" },
    });
  }

  async listarTodas(manager: EntityManager): Promise<TaxaCambio[]> {
    return manager.find(TaxaCambio, {
      relations: { moedaOrigem: true, moedaDestino: true },
      order: { dataTaxa: "DESC" },
    });
  }
}
