import { describe, expect, it } from "vitest";
import {
  ALL_METHODS,
  financialReportParams,
  financialReportQuery,
  readFinancialReportFilters,
} from "@/components/financial-report/financial-report-filters";

const month = { from: "2026-11-01", to: "2026-11-30" };

describe("readFinancialReportFilters", () => {
  it("método desconhecido vira todos; período inválido é ignorado", () => {
    expect(
      readFinancialReportFilters(
        { metodo: "x", de: "2026-11-10", ate: "2026-11-01" },
        ["m1"],
      ),
    ).toEqual({ method: ALL_METHODS, from: "", to: "" });
  });

  it("lê método e período válidos", () => {
    expect(
      readFinancialReportFilters(
        { metodo: "m1", de: "2026-10-01", ate: "2026-10-31" },
        ["m1"],
      ),
    ).toEqual({ method: "m1", from: "2026-10-01", to: "2026-10-31" });
  });
});

describe("financialReportQuery", () => {
  it("o padrão fica fora da URL", () => {
    expect(
      financialReportQuery(
        { method: ALL_METHODS, from: "", to: "" },
        month,
      ).toString(),
    ).toBe("");
  });

  it("método e outro período", () => {
    expect(
      financialReportQuery({ method: "m1", from: "", to: "" }, month, {
        from: "2026-10-01",
        to: "2026-10-31",
      }).toString(),
    ).toBe("metodo=m1&de=2026-10-01&ate=2026-10-31");
  });
});

describe("financialReportParams", () => {
  it("todos os métodos e mês atual: sem filtro na API", () => {
    expect(
      financialReportParams({ method: ALL_METHODS, from: "", to: "" }),
    ).toEqual({ from: undefined, to: undefined, paymentMethodId: undefined });
  });
});
