import { describe, it, expect } from "vitest";
import { converterMoeda } from "./currencyConverter.service";

describe("converterMoeda", () => {
  it("multiplica o valor pelo fator de câmbio e arredonda para 2 casas decimais", () => {
    expect(converterMoeda("1000.00", "5.25")).toBe("5250.00");
  });

  it("arredonda corretamente valores com mais de 2 casas decimais resultantes", () => {
    expect(converterMoeda("887.97", "0.000200")).toBe("0.18");
  });

  it("mantém o valor original quando o fator é 1", () => {
    expect(converterMoeda("1234.56", "1.000000")).toBe("1234.56");
  });
});
