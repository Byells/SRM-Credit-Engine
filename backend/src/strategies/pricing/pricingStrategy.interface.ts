export interface PricingInput {
  valorFace: string;
  taxaBase: string;
  spread: string;
  prazoMeses: number;
}

export interface PricingResult {
  valorPresente: string;
}

export interface PricingStrategy {
  calcular(input: PricingInput): PricingResult;
}
