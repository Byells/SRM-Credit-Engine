import { describe, it, expect } from "vitest";
import {
  decimalPositivoSchema,
  decimalNaoNegativoSchema,
} from "./decimal.schema";

describe("decimalPositivoSchema", () => {
  it("aceita um decimal positivo válido", () => {
    expect(decimalPositivoSchema.safeParse("100.50").success).toBe(true);
  });

  it("aceita um inteiro positivo válido", () => {
    expect(decimalPositivoSchema.safeParse("100").success).toBe(true);
  });

  it("rejeita zero", () => {
    expect(decimalPositivoSchema.safeParse("0").success).toBe(false);
  });

  it("rejeita valores negativos", () => {
    expect(decimalPositivoSchema.safeParse("-5.00").success).toBe(false);
  });

  it("rejeita strings não numéricas", () => {
    expect(decimalPositivoSchema.safeParse("abc").success).toBe(false);
  });

  it("rejeita números com vírgula (formato BR) — só aceita ponto decimal", () => {
    expect(decimalPositivoSchema.safeParse("100,50").success).toBe(false);
  });
});

describe("decimalNaoNegativoSchema", () => {
  it("aceita zero", () => {
    expect(decimalNaoNegativoSchema.safeParse("0").success).toBe(true);
  });

  it("aceita positivos", () => {
    expect(decimalNaoNegativoSchema.safeParse("42.10").success).toBe(true);
  });

  it("rejeita negativos", () => {
    expect(decimalNaoNegativoSchema.safeParse("-1").success).toBe(false);
  });
});
