import { describe, it, expect } from "vitest";
import { calcularValorPresente } from "./pricingFormula";
import { BusinessRuleError } from "../../errors/businessRuler.error";

describe("calcularValorPresente", () => {
  it("aplica a fórmula Valor Presente = Valor Face / (1 + Taxa Base + Spread)^Prazo", () => {
    const resultado = calcularValorPresente({
      valorFace: "1000.00",
      taxaBase: "0.005",
      spread: "0.015",
      prazoMeses: 6,
    });

    expect(resultado).toBe("887.97");
  });

  it("retorna o próprio valor face quando taxa base e spread são zero", () => {
    const resultado = calcularValorPresente({
      valorFace: "500.00",
      taxaBase: "0",
      spread: "0",
      prazoMeses: 3,
    });

    expect(resultado).toBe("500.00");
  });

  it("lança BusinessRuleError quando o prazo é zero ou negativo", () => {
    expect(() =>
      calcularValorPresente({
        valorFace: "1000.00",
        taxaBase: "0.005",
        spread: "0.015",
        prazoMeses: 0,
      }),
    ).toThrow(BusinessRuleError);
  });

  it("lança BusinessRuleError quando o valor face é zero ou negativo", () => {
    expect(() =>
      calcularValorPresente({
        valorFace: "-10.00",
        taxaBase: "0.005",
        spread: "0.015",
        prazoMeses: 6,
      }),
    ).toThrow(BusinessRuleError);
  });
});
