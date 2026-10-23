import { describe, expect, it } from "vitest";
import type { PeriodAvailability } from "@/app/(admin)/appointment-actions";
import {
  datesOnWeekDay,
  periodStarts,
} from "@/components/agenda/period-availability";
import { minutesToTime } from "@/utils/time";

const times = (minutes: number[]) => minutes.map(minutesToTime);

describe("datesOnWeekDay", () => {
  it("lista as datas do dia da semana, de 7 em 7 dias, com as pontas incluídas", () => {
    // 19/10/2026 é segunda-feira.
    expect(datesOnWeekDay("2026-10-19", "2026-11-09", "MONDAY")).toEqual([
      "2026-10-19",
      "2026-10-26",
      "2026-11-02",
      "2026-11-09",
    ]);
  });

  it("começa na primeira ocorrência depois da data inicial", () => {
    // 21/10 é quarta; a primeira quinta é 22/10.
    expect(datesOnWeekDay("2026-10-21", "2026-11-05", "THURSDAY")).toEqual([
      "2026-10-22",
      "2026-10-29",
      "2026-11-05",
    ]);
  });

  it("período de um dia só", () => {
    expect(datesOnWeekDay("2026-10-22", "2026-10-22", "THURSDAY")).toEqual([
      "2026-10-22",
    ]);
  });

  it("não devolve nada quando o dia da semana não cai no período", () => {
    expect(datesOnWeekDay("2026-10-19", "2026-10-21", "FRIDAY")).toEqual([]);
  });

  it("atravessa o virar do ano", () => {
    expect(datesOnWeekDay("2026-12-28", "2027-01-11", "MONDAY")).toEqual([
      "2026-12-28",
      "2027-01-04",
      "2027-01-11",
    ]);
  });
});

describe("periodStarts", () => {
  const base: PeriodAvailability = {
    windows: { MONDAY: [{ start: "09:00", end: "12:00" }] },
    busy: {},
    today: "2026-10-19",
    nowMinutes: 0,
  };

  const period = {
    weekDay: "MONDAY" as const,
    startDate: "2026-10-19",
    endDate: "2026-11-02",
    duration: 60,
  };

  it("sem conflitos, todos os horários da janela servem", () => {
    const starts = periodStarts({ availability: base, ...period });

    expect(times(starts)).toEqual([
      "09:00",
      "09:15",
      "09:30",
      "09:45",
      "10:00",
      "10:15",
      "10:30",
      "10:45",
      "11:00",
    ]);
  });

  it("um horário só vale se estiver livre em TODAS as datas do período", () => {
    const starts = periodStarts({
      availability: {
        ...base,
        // Só na segunda de 26/10 há agendamento, das 10:00 às 11:00.
        busy: { "2026-10-26": [{ start: "10:00", end: "11:00" }] },
      },
      ...period,
    });

    expect(times(starts)).toEqual(["09:00", "11:00"]);
  });

  it("agendamentos de datas diferentes se somam na exclusão", () => {
    const starts = periodStarts({
      availability: {
        ...base,
        busy: {
          "2026-10-19": [{ start: "09:00", end: "10:00" }],
          "2026-11-02": [{ start: "11:00", end: "12:00" }],
        },
      },
      ...period,
    });

    expect(times(starts)).toEqual(["10:00"]);
  });

  it("sem horário em comum, devolve lista vazia", () => {
    const starts = periodStarts({
      availability: {
        ...base,
        busy: {
          "2026-10-19": [{ start: "09:00", end: "12:00" }],
        },
      },
      ...period,
    });

    expect(starts).toEqual([]);
  });

  it("considera as sessões já escolhidas na mesma tela (extraBusy)", () => {
    const starts = periodStarts({
      availability: base,
      ...period,
      extraBusy: [{ start: "09:00", end: "10:30" }],
    });

    expect(times(starts)).toEqual(["10:30", "10:45", "11:00"]);
  });

  it("ignora as datas que já passaram", () => {
    const starts = periodStarts({
      availability: {
        ...base,
        today: "2026-10-26",
        // A segunda de 19/10 está lotada, mas já passou: não conta.
        busy: { "2026-10-19": [{ start: "09:00", end: "12:00" }] },
      },
      ...period,
    });

    expect(times(starts)).toHaveLength(9);
  });

  it("hoje, só vale depois do horário atual", () => {
    const starts = periodStarts({
      availability: { ...base, nowMinutes: 10 * 60 },
      ...period,
      endDate: "2026-10-19",
    });

    // 10:00 já está em curso: o primeiro horário é depois dele.
    expect(times(starts)[0]).toBe("10:15");
  });

  it("sem janela no dia da semana, não há horário", () => {
    expect(
      periodStarts({ availability: base, ...period, weekDay: "TUESDAY" }),
    ).toEqual([]);
  });

  it("período inteiro no passado, não há horário", () => {
    expect(
      periodStarts({
        availability: { ...base, today: "2026-12-01" },
        ...period,
      }),
    ).toEqual([]);
  });

  it("o dia da semana não aparece no período, não há horário", () => {
    expect(
      periodStarts({
        availability: base,
        ...period,
        startDate: "2026-10-20",
        endDate: "2026-10-22",
      }),
    ).toEqual([]);
  });
});
