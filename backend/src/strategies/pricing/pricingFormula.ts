import Decimal from "decimal.js";
import { PricingInput } from "./pricingStrategy.interface";
import { BusinessRuleError } from "../../errors/businessRuler.error";

export function calcularValorPresente(input: PricingInput): string {
  const valorFace = new Decimal(input.valorFace);
  if (input.prazoMeses <= 0 || Number(valorFace) <= 0) {
    throw new BusinessRuleError(
      "Valor Face ou Prazo Meses não é um número válido",
    );
  }
  const taxaBase = new Decimal(input.taxaBase);
  const spread = new Decimal(input.spread);
  const taxaTotal = taxaBase.plus(spread);

  const divisor = new Decimal(1).plus(taxaTotal).pow(input.prazoMeses);
  const valorPresente = valorFace.dividedBy(divisor);

  return valorPresente.toFixed(2);
}
