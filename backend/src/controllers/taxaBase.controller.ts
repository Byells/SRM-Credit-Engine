import { Service, Inject } from "typedi";
import { Request, Response, NextFunction } from "express";
import { DataSource } from "typeorm";
import { TaxaBaseRepository } from "../repositories/taxaBase.repository";
import { TAXA_BASE_REFERENCIAL } from "../constants/taxaBase.constant";
import { NotFoundError } from "../errors/notFound.error";

@Service()
export class TaxaBaseController {
  constructor(
    @Inject("dataSource") private dataSource: DataSource,
    private taxaBaseRepository: TaxaBaseRepository,
  ) {}

  buscarAtual = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const taxaBase = await this.taxaBaseRepository.buscarTaxaBase(
        this.dataSource.manager,
        TAXA_BASE_REFERENCIAL,
      );
      if (!taxaBase) throw new NotFoundError("Taxa base vigente não encontrada");
      return res.status(200).json(taxaBase);
    } catch (error) {
      next(error);
    }
  };
}
