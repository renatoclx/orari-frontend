import { describe, expect, it } from "vitest";
import {
  changeText,
  dashboardQuery,
  previousPeriod,
  rateChangeText,
  readDashboardFilters,
} from "@/components/dashboard/dashboard-filters";

describe("readDashboardFilters / dashboardQuery", () => {
  const month = { from: "2026-11-01", to: "2026-11-30" };

  it("período inválido é ignorado; o mês atual fica fora da URL", () => {
    expect(
      readDashboardFilters({ de: "2026-11-10", ate: "2026-11-01" }),
    ).toEqual({ from: "", to: "" });
    expect(dashboardQuery({ from: "", to: "" }, month).toString()).toBe("");
    expect(
      dashboardQuery(
        { from: "2026-10-01", to: "2026-10-31" },
        month,
      ).toString(),
    ).toBe("de=2026-10-01&ate=2026-10-31");
  });
});

describe("previousPeriod", () => {
  it("mês inteiro: o mês anterior inteiro (também na virada do ano)", () => {
    expect(previousPeriod("2026-11-01", "2026-11-30")).toEqual({
      from: "2026-10-01",
      to: "2026-10-31",
      label: "mês anterior",
    });
    expect(previousPeriod("2027-01-01", "2027-01-31").from).toBe("2026-12-01");
    expect(previousPeriod("2026-03-01", "2026-03-31").to).toBe("2026-02-28");
  });

  it("outro período: os dias logo antes, do mesmo tamanho", () => {
    expect(previousPeriod("2026-11-10", "2026-11-16")).toEqual({
      from: "2026-11-03",
      to: "2026-11-09",
      label: "período anterior",
    });
  });
});

describe("changeText / rateChangeText", () => {
  it("porcentagem com sinal; sem base no anterior", () => {
    expect(changeText(112, 100, "mês anterior")).toBe("+12% vs. mês anterior");
    expect(changeText(80, 100, "mês anterior")).toBe("-20% vs. mês anterior");
    expect(changeText(5, 0, "mês anterior")).toBe(
      "Nada no mês anterior para comparar",
    );
    expect(changeText(0, 0, "mês anterior")).toBe("Igual ao mês anterior");
    expect(changeText(10, 10, "mês anterior")).toBe("Igual ao mês anterior");
  });

  it("taxa em pontos percentuais", () => {
    expect(rateChangeText(0.1, 0.125, "mês anterior")).toBe(
      "-2,5 p.p. vs. mês anterior",
    );
    expect(rateChangeText(null, 0.1, "mês anterior")).toBe(
      "Sem base no mês anterior para comparar",
    );
  });
});
