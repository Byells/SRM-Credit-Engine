import { Router } from "express";
import transacaoRoutes from "./transacao.routes";
import extratoRoutes from "./extrato.routes";
import cambioRoutes from "./cambio.routes";
import moedaRoutes from "./moeda.routes";
import cedenteRoutes from "./cedente.routes";
import tipoRecebivelRoutes from "./tipoRecebivel.routes";
import taxaBaseRoutes from "./taxaBase.routes";

const router = Router();

router.use(transacaoRoutes);
router.use(extratoRoutes);
router.use(cambioRoutes);
router.use(moedaRoutes);
router.use(cedenteRoutes);
router.use(tipoRecebivelRoutes);
router.use(taxaBaseRoutes);

export default router;
