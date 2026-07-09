import { Router } from "express";
import { Container } from "typedi";
import { CedenteController } from "../controllers/cedente.controller";

const router = Router();
const cedenteController = Container.get(CedenteController);

router.get("/cedentes", cedenteController.listar);

export default router;
