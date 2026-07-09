import { Router } from "express";
import { Container } from "typedi";
import { TipoRecebivelController } from "../controllers/tipoRecebivel.controller";

const router = Router();
const tipoRecebivelController = Container.get(TipoRecebivelController);

router.get("/tipos_recebiveis", tipoRecebivelController.listar);

export default router;
