import { describe, expect, it } from "vitest";
import {
  currentMonth,
  monthLabel,
  parseMonthParam,
  receiptNumber,
  ruleLabel,
  shiftMonth,
} from "./professional-commissions";

describe("parseMonthParam", () => {
  it("aceita AAAA-MM e ignora o resto", () => {
    expect(parseMonthParam("2026-11")).toBe("2026-11");
    for (const value of [
      "2026-13",
      "2026-00",
      "2026-1",
      "nov",
      undefined,
      ["2026-11"],
    ]) {
      expect(parseMonthParam(value)).toBeUndefined();
    }
  });
});

describe("shiftMonth", () => {
  it("anda entre meses, virando o ano", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-11", 0)).toBe("2026-11");
  });
});

describe("currentMonth", () => {
  it("usa o relógio da clínica, não o UTC", () => {
    // 01:00 UTC de 1º/12 ainda é 30/11 em São Paulo.
    expect(
      currentMonth("America/Sao_Paulo", new Date("2026-12-01T01:00:00.000Z")),
    ).toBe("2026-11");
  });
});

describe("monthLabel", () => {
  it("escreve o mês por extenso, com a inicial maiúscula", () => {
    expect(monthLabel("2026-11")).toBe("Novembro de 2026");
    expect(monthLabel("2027-03")).toBe("Março de 2027");
  });
});

describe("ruleLabel", () => {
  it("mostra o percentual sobre a base ou o valor fixo", () => {
    expect(
      ruleLabel({ type: "PERCENT", rate: "30.00", baseAmount: "180.00" }),
    ).toMatch(/^30% de R\$\s180,00$/);
    expect(
      ruleLabel({ type: "FIXED", rate: "25.00", baseAmount: "180.00" }),
    ).toBe("Valor fixo");
  });
});

describe("receiptNumber", () => {
  it("completa com zeros até quatro dígitos", () => {
    expect(receiptNumber(7)).toBe("0007");
    expect(receiptNumber(12345)).toBe("12345");
  });
});
