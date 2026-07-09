import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { CambioService } from "../services/cambio.service";
import { AtualizarTaxaCambioDTO } from "../dtos/cambio/atualizarTaxaCambio.dto";

@Service()
export class CambioController {
  constructor(private cambioService: CambioService) {}

  atualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as AtualizarTaxaCambioDTO;
      const taxa = await this.cambioService.atualizarTaxa(input);
      return res.status(201).json(taxa);
    } catch (error) {
      next(error);
    }
  };
}
