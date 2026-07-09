import { Router } from "express";
import { Container } from "typedi";
import { MoedaController } from "../controllers/moeda.controller";

const router = Router();
const moedaController = Container.get(MoedaController);

router.get("/moedas", moedaController.listar);

export default router;
