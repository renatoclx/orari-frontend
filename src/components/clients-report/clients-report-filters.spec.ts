import { describe, expect, it } from "vitest";
import {
  ageLabel,
  cityLabel,
  clientsReportQuery,
  readClientsReportFilters,
} from "@/components/clients-report/clients-report-filters";

const month = { from: "2026-11-01", to: "2026-11-30" };

describe("readClientsReportFilters", () => {
  it("período fora de ordem é ignorado", () => {
    expect(
      readClientsReportFilters({ de: "2026-11-10", ate: "2026-11-01" }),
    ).toEqual({ from: "", to: "" });
  });
});

describe("clientsReportQuery", () => {
  it("o mês atual fica fora; outro período entra", () => {
    expect(clientsReportQuery({ from: "", to: "" }, month).toString()).toBe("");
    expect(
      clientsReportQuery(
        { from: "2026-10-01", to: "2026-10-31" },
        month,
      ).toString(),
    ).toBe("de=2026-10-01&ate=2026-10-31");
  });
});

describe("rótulos", () => {
  it("faixas de idade e cidade sem endereço", () => {
    expect(ageLabel("0-17")).toBe("Até 17 anos");
    expect(ageLabel("30-44")).toBe("30 a 44 anos");
    expect(ageLabel("60+")).toBe("60 anos ou mais");
    expect(ageLabel(null)).toBe("Não informado");
    expect(cityLabel(null)).toBe("Não informado");
  });
});
