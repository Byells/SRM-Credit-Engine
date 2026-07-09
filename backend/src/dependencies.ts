// Banco de dados config
import "./config/db.config";

// Repositórios
import "./repositories/cedente.repository";
import "./repositories/extrato.repository";
import "./repositories/moeda.repository";
import "./repositories/taxaBase.repository";
import "./repositories/taxaCambio.repository";
import "./repositories/tipoRecebivel.repository";
import "./repositories/transacao.repository";

// Estratégias de pricing
import "./strategies/pricing/chequePreDatado.strategy";
import "./strategies/pricing/duplicataMercantil.strategy";
import "./strategies/pricing/pricingStrategyResolver";

// Serviços
import "./services/auditoria.service";
import "./services/cambio.service";
import "./services/currencyExchange.service";
import "./services/transacao.service";

// Controllers
import "./controllers/cambio.controller";
import "./controllers/extrato.controller";
import "./controllers/moeda.controller";
import "./controllers/transacao.controller";
