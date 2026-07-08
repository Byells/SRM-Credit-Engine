import { PricingStrategy } from "./pricingStrategy.interface";
import { DuplicataMercantilStrategy } from "./duplicataMercantilStrategy.strategy";
import { ChequePreDatadoStrategy } from "./chequePreDatadoStrategy.strategy";
import { Inject, Service } from "typedi";

@Service()
export class PricingStrategyResolver {
  private strategies: Record<string, PricingStrategy>;
  constructor(
    private readonly chequePreDatadoStrategy: ChequePreDatadoStrategy,
    private readonly duplicataMercantilStrategy: DuplicataMercantilStrategy,
  ) {
    this.strategies = {
      "Duplicata Mercantil": this.duplicataMercantilStrategy,
      "Cheque Pré-datado": this.chequePreDatadoStrategy,
    };
  }

  resolver(nomeTipoRecebivel: string): PricingStrategy {
    const strategy = this.strategies[nomeTipoRecebivel];
    if (!strategy) {
      throw new Error(
        `Nenhuma strategy encontrada para o tipo: ${nomeTipoRecebivel}`,
      );
    }
    return strategy;
  }
}
