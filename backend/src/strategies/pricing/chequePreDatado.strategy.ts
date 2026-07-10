import {
  PricingStrategy,
  PricingInput,
  PricingResult,
} from "./pricingStrategy.interface";
import { calcularValorPresente } from "./pricingFormula";
import { Service } from "typedi";

@Service()
export class ChequePreDatadoStrategy implements PricingStrategy {
  calcular(input: PricingInput): PricingResult {
    return { valorPresente: calcularValorPresente(input) };
  }
}
