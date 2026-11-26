import { describe, expect, it } from "vitest";
import { initialGridMinute } from "@/components/agenda/agenda-day-position";

// Grade das 06:00 às 20:00, clínica abrindo às 08:00.
const base = {
  range: { start: 6 * 60, end: 20 * 60 },
  unavailable: [
    { start: "06:00", end: "08:00" },
    { start: "18:00", end: "20:00" },
  ],
};

describe("initialGridMinute", () => {
  it("hoje: meia hora antes de agora", () => {
    expect(
      initialGridMinute({ ...base, nowMinutes: 14 * 60, starts: ["09:00"] }),
    ).toBe(13 * 60 + 30);
  });

  it("hoje bem cedo: não sai da grade", () => {
    expect(initialGridMinute({ ...base, nowMinutes: 6 * 60, starts: [] })).toBe(
      6 * 60,
    );
  });

  it("outro dia: no primeiro atendimento, em qualquer ordem", () => {
    expect(
      initialGridMinute({
        ...base,
        nowMinutes: null,
        starts: ["10:30", "09:15", "16:00"],
      }),
    ).toBe(9 * 60 + 15);
  });

  it("outro dia sem atendimentos: na abertura da clínica", () => {
    expect(initialGridMinute({ ...base, nowMinutes: null, starts: [] })).toBe(
      8 * 60,
    );
  });

  it("dia sem nenhuma janela (tudo fechado): no começo da grade", () => {
    expect(
      initialGridMinute({
        range: base.range,
        unavailable: [{ start: "06:00", end: "20:00" }],
        nowMinutes: null,
        starts: [],
      }),
    ).toBe(6 * 60);
  });

  it("grade que já começa aberta: no começo", () => {
    expect(
      initialGridMinute({
        range: base.range,
        unavailable: [],
        nowMinutes: null,
        starts: [],
      }),
    ).toBe(6 * 60);
  });
});
