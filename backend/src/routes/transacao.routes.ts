import { Router } from "express";
import { Container } from "typedi";
import { TransacaoController } from "../controllers/transacao.controller";
import { validate } from "../middlewares/validate.middleware";
import { criarTransacaoSchema } from "../dtos/transacao/criarTransacao.dto";

const router = Router();
const transacaoController = Container.get(TransacaoController);

router.post(
  "/transacoes",
  validate(criarTransacaoSchema, "body"),
  transacaoController.criar,
);

export default router;
