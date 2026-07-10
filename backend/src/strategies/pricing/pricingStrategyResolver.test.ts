import { describe, it, expect } from "vitest";
import { PricingStrategyResolver } from "./pricingStrategyResolver";
import { DuplicataMercantilStrategy } from "./duplicataMercantil.strategy";
import { ChequePreDatadoStrategy } from "./chequePreDatado.strategy";
import { BusinessRuleError } from "../../errors/businessRuler.error";

describe("PricingStrategyResolver", () => {
  const resolver = new PricingStrategyResolver(
    new ChequePreDatadoStrategy(),
    new DuplicataMercantilStrategy(),
  );

  it("resolve a strategy de Duplicata Mercantil (spread 1.5% a.m.)", () => {
    expect(resolver.resolver("Duplicata Mercantil")).toBeInstanceOf(
      DuplicataMercantilStrategy,
    );
  });

  it("resolve a strategy de Cheque Pré-datado (spread 2.5% a.m.)", () => {
    expect(resolver.resolver("Cheque Pré-datado")).toBeInstanceOf(
      ChequePreDatadoStrategy,
    );
  });

  it("lança BusinessRuleError para um tipo de recebível desconhecido", () => {
    expect(() => resolver.resolver("Nota Promissória")).toThrow(
      BusinessRuleError,
    );
  });

  it("as duas strategies aplicam a mesma fórmula, resultando em valores diferentes por causa do spread", () => {
    const input = {
      valorFace: "1000.00",
      taxaBase: "0.005",
      prazoMeses: 6,
    };

    const duplicata = resolver
      .resolver("Duplicata Mercantil")
      .calcular({ ...input, spread: "0.015" });
    const cheque = resolver
      .resolver("Cheque Pré-datado")
      .calcular({ ...input, spread: "0.025" });

    expect(Number(duplicata.valorPresente)).toBeGreaterThan(
      Number(cheque.valorPresente),
    );
  });
});
