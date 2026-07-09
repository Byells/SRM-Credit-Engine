import { Service, Inject } from "typedi";
import { Request, Response, NextFunction } from "express";
import { DataSource } from "typeorm";
import { CedenteRepository } from "../repositories/cedente.repository";

@Service()
export class CedenteController {
  constructor(
    @Inject("dataSource") private dataSource: DataSource,
    private cedenteRepository: CedenteRepository,
  ) {}

  listar = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const cedentes = await this.cedenteRepository.listarTodos(
        this.dataSource.manager,
      );
      return res.status(200).json(cedentes);
    } catch (error) {
      next(error);
    }
  };
}
