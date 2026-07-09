import { Router } from "express";
import { Container } from "typedi";
import { ExtratoController } from "../controllers/extrato.controller";
import { validate } from "../middlewares/validate.middleware";
import { extratoQuerySchema } from "../dtos/extrato/extratoQuery.dto";

const router = Router();
const extratoController = Container.get(ExtratoController);

router.get(
  "/extrato",
  validate(extratoQuerySchema, "query"),
  extratoController.buscar,
);

export default router;
