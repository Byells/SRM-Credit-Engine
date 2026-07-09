import { Router } from "express";
import transacaoRoutes from "./transacao.routes";
import extratoRoutes from "./extrato.routes";
import cambioRoutes from "./cambio.routes";
import moedaRoutes from "./moeda.routes";

const router = Router();

router.use(transacaoRoutes);
router.use(extratoRoutes);
router.use(cambioRoutes);
router.use(moedaRoutes);

export default router;
