import { describe, expect, it } from "vitest";
import {
  ALL_PROFESSIONALS,
  appointmentReportQuery,
  readAppointmentReportFilters,
} from "@/components/appointment-report/appointment-report-filters";

const month = { from: "2026-11-01", to: "2026-11-30" };

describe("readAppointmentReportFilters", () => {
  it("profissional desconhecido vira todos; período inválido é ignorado", () => {
    expect(
      readAppointmentReportFilters(
        { profissional: "x", de: "2026-11-10", ate: "2026-11-01" },
        ["p1"],
      ),
    ).toEqual({ professional: ALL_PROFESSIONALS, from: "", to: "" });
  });

  it("lê profissional e período válidos", () => {
    expect(
      readAppointmentReportFilters(
        { profissional: "p1", de: "2026-10-01", ate: "2026-10-31" },
        ["p1"],
      ),
    ).toEqual({ professional: "p1", from: "2026-10-01", to: "2026-10-31" });
  });
});

describe("appointmentReportQuery", () => {
  it("o padrão fica fora da URL", () => {
    expect(
      appointmentReportQuery(
        { professional: ALL_PROFESSIONALS, from: "", to: "" },
        month,
      ).toString(),
    ).toBe("");
  });

  it("profissional e outro período", () => {
    expect(
      appointmentReportQuery(
        { professional: "p1", from: "2026-10-01", to: "" },
        month,
      ).toString(),
    ).toBe("profissional=p1&de=2026-10-01&ate=2026-11-30");
  });
});
