import { describe, expect, it } from "vitest";
import {
  daysLabel,
  formatDay,
  periodLabel,
  planStatusLabel,
  recurrenceKindLabel,
} from "@/components/client-app/agreements";

describe("pacotes", () => {
  it("situação e período", () => {
    expect(planStatusLabel("active")).toBe("Ativo");
    expect(planStatusLabel("finished")).toBe("Encerrado");
    expect(planStatusLabel("cancelled")).toBe("Cancelado");
    expect(formatDay("2026-11-12")).toBe("12/11/2026");
    expect(periodLabel("2026-11-12", "2027-05-11")).toBe(
      "De 12/11/2026 a 11/05/2027",
    );
    expect(periodLabel("2026-11-12", null)).toBe("Desde 12/11/2026");
  });
});

describe("daysLabel", () => {
  const day = (weekDay: string, startTime: string) => ({
    weekDay,
    startTime,
    endTime: "23:00",
  });

  it("junta os dias com o mesmo horário, na ordem da semana", () => {
    expect(
      daysLabel([day("THURSDAY", "09:00"), day("TUESDAY", "09:00")]),
    ).toEqual(["Ter e Qui às 09:00"]);
  });

  it("horários diferentes viram linhas; três dias com vírgula", () => {
    expect(
      daysLabel([
        day("MONDAY", "18:00"),
        day("WEDNESDAY", "18:00"),
        day("FRIDAY", "18:00"),
        day("SATURDAY", "08:00"),
      ]),
    ).toEqual(["Sáb às 08:00", "Seg, Qua e Sex às 18:00"]);
  });
});

describe("recurrenceKindLabel", () => {
  it("turma, pacote ou horário fixo", () => {
    expect(recurrenceKindLabel("CLASS")).toBe("Turma");
    expect(recurrenceKindLabel("PLAN")).toBe("Pacote");
    expect(recurrenceKindLabel("RECURRENCE")).toBe("Horário fixo");
  });
});
