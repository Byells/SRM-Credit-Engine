import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { TransacaoService } from "../services/transacao.service";
import { CriarTransacaoDTO } from "../dtos/transacao/criarTransacao.dto";

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
}
