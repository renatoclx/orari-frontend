import { describe, expect, it } from "vitest";
import {
  MAX_RECURRENCE_MONTHS,
  WEEK_DAYS,
  addMonths,
  describeDays,
  occurrences,
  shortDayLabel,
  weekDayName,
} from "@/components/recurrences/recurrence-schedule";
import type { RecurrenceDay } from "@/types/recurrence";
import { shiftDateString } from "@/utils/time";

const monday = (startTime = "09:00", endTime = "10:00"): RecurrenceDay => ({
  weekDay: "MONDAY",
  startTime,
  endTime,
});
const wednesday = (startTime = "14:00", endTime = "15:00"): RecurrenceDay => ({
  weekDay: "WEDNESDAY",
  startTime,
  endTime,
});

// "hoje" bem no passado: nada é cortado por já ter passado.
const LONG_AGO = "2000-01-01";

describe("WEEK_DAYS", () => {
  it("vai de segunda a domingo", () => {
    expect(WEEK_DAYS.map((day) => day.id)).toEqual([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]);
  });
});

describe("weekDayName e shortDayLabel", () => {
  it("dá o dia da semana por extenso, em minúsculas", () => {
    expect(weekDayName("2026-10-20")).toBe("terça-feira");
    expect(weekDayName("2026-10-25")).toBe("domingo");
  });

  it("monta o rótulo curto da primeira sessão", () => {
    expect(shortDayLabel("2026-10-26")).toBe("segunda, 26/10");
    expect(shortDayLabel("2026-10-24")).toBe("sábado, 24/10");
    expect(shortDayLabel("2026-10-25")).toBe("domingo, 25/10");
  });
});

describe("describeDays", () => {
  it("lista os dias na ordem da semana, não na ordem recebida", () => {
    expect(describeDays([wednesday(), monday()])).toBe(
      "Seg 09:00–10:00, Qua 14:00–15:00",
    );
  });

  it("não altera a lista recebida", () => {
    const days = [wednesday(), monday()];

    describeDays(days);

    expect(days[0].weekDay).toBe("WEDNESDAY");
  });

  it("lista vazia vira texto vazio", () => {
    expect(describeDays([])).toBe("");
  });
});

describe("occurrences", () => {
  it("gera uma sessão por data do dia da semana, com as pontas incluídas", () => {
    const result = occurrences(
      "2026-10-19",
      "2026-11-02",
      [monday()],
      LONG_AGO,
      0,
    );

    expect(result.map((item) => item.date)).toEqual([
      "2026-10-19",
      "2026-10-26",
      "2026-11-02",
    ]);
    expect(result[0].day.startTime).toBe("09:00");
  });

  it("vários dias da semana saem em ordem de data", () => {
    const result = occurrences(
      "2026-10-19",
      "2026-10-28",
      [wednesday(), monday()],
      LONG_AGO,
      0,
    );

    expect(result.map((item) => `${item.date} ${item.day.weekDay}`)).toEqual([
      "2026-10-19 MONDAY",
      "2026-10-21 WEDNESDAY",
      "2026-10-26 MONDAY",
      "2026-10-28 WEDNESDAY",
    ]);
  });

  it("não inclui datas que já passaram", () => {
    const result = occurrences(
      "2026-10-19",
      "2026-11-02",
      [monday()],
      "2026-10-26",
      0,
    );

    expect(result.map((item) => item.date)).toEqual([
      "2026-10-26",
      "2026-11-02",
    ]);
  });

  it("hoje, só entram sessões que começam depois do horário atual", () => {
    const today = "2026-10-26";
    const nowMinutes = 10 * 60;
    const at = (time: string) =>
      occurrences(today, today, [monday(time, "23:00")], today, nowMinutes);

    expect(at("09:00")).toHaveLength(0);
    // Começar exatamente agora já é passado.
    expect(at("10:00")).toHaveLength(0);
    expect(at("10:30")).toHaveLength(1);
  });

  it("período invertido ou incompleto não gera nada", () => {
    expect(
      occurrences("2026-11-02", "2026-10-19", [monday()], LONG_AGO, 0),
    ).toEqual([]);
    expect(occurrences("", "2026-10-19", [monday()], LONG_AGO, 0)).toEqual([]);
    expect(occurrences("2026-10-19", "", [monday()], LONG_AGO, 0)).toEqual([]);
  });

  it("sem dias escolhidos, não há sessões", () => {
    expect(occurrences("2026-10-19", "2026-11-02", [], LONG_AGO, 0)).toEqual(
      [],
    );
  });

  it("nunca percorre mais de 5 anos (trava de segurança)", () => {
    const start = "2026-01-01";
    const result = occurrences(start, "2040-12-31", [monday()], LONG_AGO, 0);

    expect(result.length).toBeGreaterThan(200);
    expect(result.at(-1)!.date <= shiftDateString(start, 1829)).toBe(true);
  });

  it("um ano de uma sessão por semana dá 52 ou 53 sessões", () => {
    const result = occurrences(
      "2026-10-19",
      addMonths("2026-10-19", MAX_RECURRENCE_MONTHS),
      [monday()],
      LONG_AGO,
      0,
    );

    expect([52, 53]).toContain(result.length);
  });
});

describe("addMonths", () => {
  it("soma meses de calendário mantendo o dia", () => {
    expect(addMonths("2026-10-14", 1)).toBe("2026-11-14");
    expect(addMonths("2026-10-14", 12)).toBe("2027-10-14");
    expect(addMonths("2026-11-15", 3)).toBe("2027-02-15");
  });

  it("usa o último dia do mês quando o dia não existe", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonths("2026-08-31", 1)).toBe("2026-09-30");
  });

  it("29 de fevereiro cai em 28 em ano que não é bissexto", () => {
    expect(addMonths("2024-02-29", 12)).toBe("2025-02-28");
    expect(addMonths("2024-02-29", 48)).toBe("2028-02-29");
  });

  it("aceita zero e meses negativos", () => {
    expect(addMonths("2026-10-14", 0)).toBe("2026-10-14");
    expect(addMonths("2026-03-31", -1)).toBe("2026-02-28");
    expect(addMonths("2026-01-15", -2)).toBe("2025-11-15");
  });

  it("o limite da recorrência é de 12 meses", () => {
    expect(MAX_RECURRENCE_MONTHS).toBe(12);
  });
});
