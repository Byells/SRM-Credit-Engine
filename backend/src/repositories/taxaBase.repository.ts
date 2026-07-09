import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { TaxaBase } from "../entities/taxaBase.entity";

@Service()
export class TaxaBaseRepository {
  async buscarTaxaBase(
    manager: EntityManager,
    nome: string,
  ): Promise<TaxaBase | null> {
    return manager.findOne(TaxaBase, {
      where: { nome },
      order: { dataVigencia: "DESC" },
    });
  }
}
