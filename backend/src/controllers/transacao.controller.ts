import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { TransacaoService } from "../services/transacao.service";
import { CriarTransacaoDTO } from "../dtos/transacao/criarTransacao.dto";
import { TransacaoIdParamDTO } from "../dtos/transacao/transacaoIdParam.dto";

@Service()
export class TransacaoController {
  constructor(private transacaoService: TransacaoService) {}

  criar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as CriarTransacaoDTO;
      const transacao = await this.transacaoService.criar(input);
      return res.status(201).json(transacao);
    } catch (error) {
      next(error);
    }
  };

  liquidar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as unknown as TransacaoIdParamDTO;
      const transacao = await this.transacaoService.liquidar(id);
      return res.status(200).json(transacao);
    } catch (error) {
      next(error);
    }
  };
}
