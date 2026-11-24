import { describe, expect, it } from "vitest";
import {
  agendaBlockErrors,
  agendaBlockLabel,
  blockRangesOfDay,
  subtractRanges,
} from "./agenda-block";

const TZ = "America/Sao_Paulo";
// 09/11/2026 às 09:00 no relógio da empresa.
const NOW = new Date("2026-11-09T12:00:00.000Z");
const valid = { date: "2026-11-10", startTime: "14:00", endTime: "16:30" };

describe("agendaBlockErrors", () => {
  it("aceita um intervalo futuro", () => {
    expect(agendaBlockErrors(valid, NOW, TZ)).toEqual({});
  });

  it("pede data, início e fim", () => {
    expect(
      agendaBlockErrors({ date: "", startTime: "", endTime: "" }, NOW, TZ),
    ).toEqual({
      date: "Escolha a data.",
      startTime: "Informe o início.",
      endTime: "Informe o fim.",
    });
  });

  it("recusa fim igual ou antes do início", () => {
    expect(
      agendaBlockErrors({ ...valid, endTime: "14:00" }, NOW, TZ).endTime,
    ).toBe("O fim precisa ser depois do início.");
  });

  it("recusa o horário que já começou (hoje mais cedo ou dia passado)", () => {
    const today = { date: "2026-11-09", startTime: "08:30", endTime: "10:00" };
    expect(agendaBlockErrors(today, NOW, TZ).startTime).toBe(
      "Esse horário já começou.",
    );
    expect(
      agendaBlockErrors({ ...today, startTime: "09:30" }, NOW, TZ),
    ).toEqual({});
    expect(
      agendaBlockErrors({ ...valid, date: "2026-11-08" }, NOW, TZ).startTime,
    ).toBe("Esse horário já começou.");
  });
});

describe("agendaBlockLabel", () => {
  it("mostra dia e horários no relógio da empresa", () => {
    expect(
      agendaBlockLabel(
        {
          startAt: "2026-11-10T17:00:00.000Z",
          endAt: "2026-11-10T19:30:00.000Z",
        },
        TZ,
      ),
    ).toBe("Ter, 10/11/2026 · 14:00 às 16:30");
  });
});

describe("blockRangesOfDay", () => {
  it("converte para o relógio da empresa e fica só com os do dia", () => {
    expect(
      blockRangesOfDay(
        [
          // 10/11 das 14:00 às 16:30 (UTC-3).
          {
            startAt: "2026-11-10T17:00:00.000Z",
            endAt: "2026-11-10T19:30:00.000Z",
          },
          // 11/11: outro dia.
          {
            startAt: "2026-11-11T12:00:00.000Z",
            endAt: "2026-11-11T13:00:00.000Z",
          },
        ],
        "2026-11-10",
        TZ,
      ),
    ).toEqual([{ start: "14:00", end: "16:30" }]);
  });
});

describe("subtractRanges", () => {
  it("corta a janela no meio, na borda e por inteiro", () => {
    const windows = [
      { start: "08:00", end: "12:00" },
      { start: "13:00", end: "18:00" },
    ];
    expect(subtractRanges(windows, [{ start: "10:00", end: "11:00" }])).toEqual(
      [
        { start: "08:00", end: "10:00" },
        { start: "11:00", end: "12:00" },
        { start: "13:00", end: "18:00" },
      ],
    );
    expect(subtractRanges(windows, [{ start: "07:00", end: "09:00" }])).toEqual(
      [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "18:00" },
      ],
    );
    expect(subtractRanges(windows, [{ start: "12:30", end: "19:00" }])).toEqual(
      [{ start: "08:00", end: "12:00" }],
    );
  });
});
