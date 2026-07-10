import Decimal from "decimal.js";

export function converterMoeda(valor: string, fatorCambio: string): string {
  return new Decimal(valor).times(fatorCambio).toFixed(2);
}
