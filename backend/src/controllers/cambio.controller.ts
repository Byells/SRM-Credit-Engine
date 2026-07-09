import { Service, Inject } from "typedi";
import { Request, Response, NextFunction } from "express";
import { DataSource } from "typeorm";
import { CambioService } from "../services/cambio.service";
import { TaxaCambioRepository } from "../repositories/taxaCambio.repository";
import { AtualizarTaxaCambioDTO } from "../dtos/cambio/atualizarTaxaCambio.dto";

@Service()
export class CambioController {
  constructor(
    @Inject("dataSource") private dataSource: DataSource,
    private cambioService: CambioService,
    private taxaCambioRepository: TaxaCambioRepository,
  ) {}

  atualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as AtualizarTaxaCambioDTO;
      const taxa = await this.cambioService.atualizarTaxa(input);
      return res.status(201).json(taxa);
    } catch (error) {
      next(error);
    }
  };

  listar = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const taxas = await this.taxaCambioRepository.listarTodas(
        this.dataSource.manager,
      );
      return res.status(200).json(taxas);
    } catch (error) {
      next(error);
    }
  };
}
