import { Router } from "express";
import { Container } from "typedi";
import { CambioController } from "../controllers/cambio.controller";
import { validate } from "../middlewares/validate.middleware";
import { atualizarTaxaCambioSchema } from "../dtos/cambio/atualizarTaxaCambio.dto";

const router = Router();
const cambioController = Container.get(CambioController);

router.get("/cambio", cambioController.listar);

router.post(
  "/cambio",
  validate(atualizarTaxaCambioSchema, "body"),
  cambioController.atualizar,
);

export default router;
