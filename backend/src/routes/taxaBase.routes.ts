import { Router } from "express";
import { Container } from "typedi";
import { TaxaBaseController } from "../controllers/taxaBase.controller";

const router = Router();
const taxaBaseController = Container.get(TaxaBaseController);

router.get("/taxa-base", taxaBaseController.buscarAtual);

export default router;
