import { describe, expect, it } from "vitest";
import {
  dayBounds,
  formatLongDate,
  isDateString,
  minutesToTime,
  shiftDateString,
  timeToMinutes,
  toDateString,
  toTimeString,
  weekDayOf,
} from "@/utils/time";

const SP = "America/Sao_Paulo";

describe("timeToMinutes e minutesToTime", () => {
  it("convertem horário em minutos desde a meia-noite", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("voltam para HH:MM com zero à esquerda", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(65)).toBe("01:05");
    expect(minutesToTime(570)).toBe("09:30");
  });

  it("24:00 existe: é o fim de um atendimento que vai até a meia-noite", () => {
    expect(minutesToTime(1440)).toBe("24:00");
    expect(timeToMinutes("24:00")).toBe(1440);
  });

  it("uma conversão desfaz a outra", () => {
    for (const time of ["00:00", "07:45", "12:00", "18:15", "23:59"]) {
      expect(minutesToTime(timeToMinutes(time))).toBe(time);
    }
  });
});

describe("isDateString", () => {
  it("aceita datas de calendário válidas", () => {
    expect(isDateString("2026-10-14")).toBe(true);
    expect(isDateString("2026-12-31")).toBe(true);
  });

  it("considera o ano bissexto", () => {
    expect(isDateString("2024-02-29")).toBe(true);
    expect(isDateString("2026-02-29")).toBe(false);
    expect(isDateString("2100-02-29")).toBe(false);
  });

  it("recusa dias e meses que não existem", () => {
    expect(isDateString("2026-02-30")).toBe(false);
    expect(isDateString("2026-04-31")).toBe(false);
    expect(isDateString("2026-13-01")).toBe(false);
    expect(isDateString("2026-00-10")).toBe(false);
    expect(isDateString("2026-10-00")).toBe(false);
  });

  it("recusa formatos diferentes de aaaa-mm-dd", () => {
    for (const value of [
      "",
      "2026-1-1",
      "14/10/2026",
      "2026-10-14T00:00:00Z",
      " 2026-10-14",
      "2026-10-14 ",
      "lixo",
    ]) {
      expect(isDateString(value)).toBe(false);
    }
  });
});

describe("shiftDateString", () => {
  it("soma e subtrai dias de calendário", () => {
    expect(shiftDateString("2026-10-14", 1)).toBe("2026-10-15");
    expect(shiftDateString("2026-10-14", -1)).toBe("2026-10-13");
    expect(shiftDateString("2026-10-14", 0)).toBe("2026-10-14");
    expect(shiftDateString("2026-10-14", 30)).toBe("2026-11-13");
  });

  it("atravessa mês, ano e fevereiro bissexto", () => {
    expect(shiftDateString("2026-10-31", 1)).toBe("2026-11-01");
    expect(shiftDateString("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftDateString("2027-01-01", -1)).toBe("2026-12-31");
    expect(shiftDateString("2024-02-28", 1)).toBe("2024-02-29");
    expect(shiftDateString("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("weekDayOf", () => {
  it("devolve o dia da semana de uma data de calendário", () => {
    expect(weekDayOf("2026-10-19")).toBe("MONDAY");
    expect(weekDayOf("2026-10-20")).toBe("TUESDAY");
    expect(weekDayOf("2026-10-21")).toBe("WEDNESDAY");
    expect(weekDayOf("2026-10-22")).toBe("THURSDAY");
    expect(weekDayOf("2026-10-23")).toBe("FRIDAY");
    expect(weekDayOf("2026-10-24")).toBe("SATURDAY");
    expect(weekDayOf("2026-10-25")).toBe("SUNDAY");
  });
});

describe("toDateString", () => {
  it("usa o dia do fuso, não o do UTC", () => {
    // 02:30 UTC ainda é 23:30 do dia anterior em São Paulo (UTC-3).
    expect(toDateString(new Date("2026-10-15T02:30:00Z"), SP)).toBe(
      "2026-10-14",
    );
    expect(toDateString(new Date("2026-10-15T02:30:00Z"), "UTC")).toBe(
      "2026-10-15",
    );
  });

  it("vira o dia na meia-noite local", () => {
    expect(toDateString(new Date("2026-10-15T02:59:59Z"), SP)).toBe(
      "2026-10-14",
    );
    expect(toDateString(new Date("2026-10-15T03:00:00Z"), SP)).toBe(
      "2026-10-15",
    );
  });

  it("vale para fusos à frente do UTC", () => {
    expect(toDateString(new Date("2026-10-14T20:00:00Z"), "Asia/Tokyo")).toBe(
      "2026-10-15",
    );
  });
});

describe("toTimeString", () => {
  it("mostra o horário no fuso informado", () => {
    expect(toTimeString("2026-10-14T17:30:00.000Z", SP)).toBe("14:30");
    expect(toTimeString("2026-10-14T17:30:00.000Z", "UTC")).toBe("17:30");
  });

  it("a meia-noite é 00:00, nunca 24:00", () => {
    expect(toTimeString("2026-10-14T03:00:00.000Z", SP)).toBe("00:00");
  });
});

describe("dayBounds", () => {
  it("em São Paulo (UTC-3), o dia vai de 03:00 UTC a 03:00 UTC do dia seguinte", () => {
    const { from, to } = dayBounds("2026-10-14", SP);

    expect(from.toISOString()).toBe("2026-10-14T03:00:00.000Z");
    expect(to.toISOString()).toBe("2026-10-15T03:00:00.000Z");
  });

  it("em UTC, é a própria data", () => {
    const { from, to } = dayBounds("2026-10-14", "UTC");

    expect(from.toISOString()).toBe("2026-10-14T00:00:00.000Z");
    expect(to.toISOString()).toBe("2026-10-15T00:00:00.000Z");
  });

  it("aceita fuso com meia hora de diferença", () => {
    const { from } = dayBounds("2026-10-14", "Asia/Kolkata");

    expect(from.toISOString()).toBe("2026-10-13T18:30:00.000Z");
  });

  it("no dia em que o horário de verão começa, o dia tem 23 horas", () => {
    // Nova York, 8/3/2026: 02:00 vira 03:00.
    const { from, to } = dayBounds("2026-03-08", "America/New_York");

    expect(from.toISOString()).toBe("2026-03-08T05:00:00.000Z");
    expect(to.toISOString()).toBe("2026-03-09T04:00:00.000Z");
    expect((to.getTime() - from.getTime()) / 3_600_000).toBe(23);
  });

  it("no dia em que o horário de verão termina, o dia tem 25 horas", () => {
    // Nova York, 1/11/2026: 02:00 volta para 01:00.
    const { from, to } = dayBounds("2026-11-01", "America/New_York");

    expect(from.toISOString()).toBe("2026-11-01T04:00:00.000Z");
    expect(to.toISOString()).toBe("2026-11-02T05:00:00.000Z");
    expect((to.getTime() - from.getTime()) / 3_600_000).toBe(25);
  });

  it("os dias seguidos se encaixam sem buraco nem sobreposição", () => {
    const first = dayBounds("2026-10-14", SP);
    const second = dayBounds("2026-10-15", SP);

    expect(first.to.getTime()).toBe(second.from.getTime());
  });
});

describe("formatLongDate", () => {
  it("escreve o dia por extenso, com a primeira letra maiúscula", () => {
    expect(formatLongDate(new Date("2026-10-14T15:00:00Z"))).toBe(
      "Quarta-feira, 14 de outubro",
    );
  });

  it("usa o dia do fuso da empresa", () => {
    // 01:00 UTC de 15/10 ainda é 14/10 em São Paulo.
    expect(formatLongDate(new Date("2026-10-15T01:00:00Z"))).toBe(
      "Quarta-feira, 14 de outubro",
    );
  });
});
