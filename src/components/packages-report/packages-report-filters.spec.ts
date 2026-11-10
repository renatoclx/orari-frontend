import { describe, expect, it } from "vitest";
import {
  packagesReportQuery,
  readPackagesReportFilters,
  sessionsText,
} from "@/components/packages-report/packages-report-filters";

const month = { from: "2026-11-01", to: "2026-11-30" };

describe("readPackagesReportFilters", () => {
  it("período fora de ordem é ignorado", () => {
    expect(
      readPackagesReportFilters({ de: "2026-11-10", ate: "2026-11-01" }),
    ).toEqual({ from: "", to: "" });
  });

  it("lê o período válido", () => {
    expect(
      readPackagesReportFilters({ de: "2026-10-01", ate: "2026-10-31" }),
    ).toEqual({ from: "2026-10-01", to: "2026-10-31" });
  });
});

describe("packagesReportQuery", () => {
  it("o mês atual fica fora da URL", () => {
    expect(packagesReportQuery({ from: "", to: "" }, month).toString()).toBe(
      "",
    );
  });

  it("outro período", () => {
    expect(
      packagesReportQuery({ from: "", to: "" }, month, {
        from: "2026-10-01",
        to: "2026-10-31",
      }).toString(),
    ).toBe("de=2026-10-01&ate=2026-10-31");
  });
});

describe("sessionsText", () => {
  it("concluídas de total", () => {
    expect(sessionsText({ completed: 18, total: 24 })).toBe("18 de 24");
  });
});
