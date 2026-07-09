import { describe, it, expect } from "vitest";
import { normalizeNumberString, toNumber, formatCurrencyBR } from "./number";

describe("normalizeNumberString", () => {
  it("converts BR format (dot thousands, comma decimal) to plain number string", () => {
    expect(normalizeNumberString("1.234,56")).toBe("1234.56");
  });

  it("converts comma-only decimal to dot decimal", () => {
    expect(normalizeNumberString("1234,56")).toBe("1234.56");
  });

  it("keeps a plain dot-decimal string as-is", () => {
    expect(normalizeNumberString("1234.56")).toBe("1234.56");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeNumberString("")).toBe("");
  });

  it("strips non-numeric characters (e.g. currency symbols)", () => {
    expect(normalizeNumberString("R$ 1.234,56")).toBe("1234.56");
  });
});

describe("toNumber", () => {
  it("parses a normalized numeric string", () => {
    expect(toNumber("1.234,56")).toBeCloseTo(1234.56);
  });

  it("parses a plain number", () => {
    expect(toNumber(42)).toBe(42);
  });

  it("returns 0 for empty input (Number('') coerces to 0)", () => {
    expect(toNumber("")).toBe(0);
  });
});

describe("formatCurrencyBR", () => {
  it("formats a numeric string as BRL currency", () => {
    expect(formatCurrencyBR("1234.56")).toContain("1.234,56");
  });

  it("returns an empty string for unparseable input", () => {
    expect(formatCurrencyBR("1.2.3")).toBe("");
  });
});
