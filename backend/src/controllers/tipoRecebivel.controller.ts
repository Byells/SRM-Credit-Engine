import { Service, Inject } from "typedi";
import { Request, Response, NextFunction } from "express";
import { DataSource } from "typeorm";
import { TipoRecebivelRepository } from "../repositories/tipoRecebivel.repository";

@Service()
export class TipoRecebivelController {
  constructor(
    @Inject("dataSource") private dataSource: DataSource,
    private tipoRecebivelRepository: TipoRecebivelRepository,
  ) {}

  listar = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tipos = await this.tipoRecebivelRepository.listarTodos(
        this.dataSource.manager,
      );
      return res.status(200).json(tipos);
    } catch (error) {
      next(error);
    }
  };
}
