import { Router } from "express";
import { Container } from "typedi";
import { TransacaoController } from "../controllers/transacao.controller";
import { validate } from "../middlewares/validate.middleware";
import { criarTransacaoSchema } from "../dtos/transacao/criarTransacao.dto";
import { transacaoIdParamSchema } from "../dtos/transacao/transacaoIdParam.dto";

const router = Router();
const transacaoController = Container.get(TransacaoController);

router.post(
  "/transacoes",
  validate(criarTransacaoSchema, "body"),
  transacaoController.criar,
);

router.patch(
  "/transacoes/:id/liquidar",
  validate(transacaoIdParamSchema, "params"),
  transacaoController.liquidar,
);

export default router;
