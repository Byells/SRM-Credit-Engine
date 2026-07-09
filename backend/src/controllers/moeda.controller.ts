import { Service, Inject } from "typedi";
import { Request, Response, NextFunction } from "express";
import { DataSource } from "typeorm";
import { MoedaRepository } from "../repositories/moeda.repository";

@Service()
export class MoedaController {
  constructor(
    @Inject("dataSource") private dataSource: DataSource,
    private moedaRepository: MoedaRepository,
  ) {}

  listar = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const moedas = await this.moedaRepository.listarTodas(
        this.dataSource.manager,
      );
      return res.status(200).json(moedas);
    } catch (error) {
      next(error);
    }
  };
}
