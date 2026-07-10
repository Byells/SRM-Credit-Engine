import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { ExtratoRepository } from "../repositories/extrato.repository";
import { ExtratoQueryDTO } from "../dtos/extrato/extratoQuery.dto";

@Service()
export class ExtratoController {
  constructor(private extratoRepository: ExtratoRepository) {}

  buscar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filtros = req.query as unknown as ExtratoQueryDTO;
      const resultado = await this.extratoRepository.buscar(filtros);
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}
