import { describe, expect, it } from "vitest";
import {
  attendanceCount,
  comparison,
  weekBars,
  weekDescription,
  weekTotal,
} from "./professional-home";

const WEEK = [
  { date: "2026-11-09", count: 4 },
  { date: "2026-11-10", count: 2 },
  { date: "2026-11-11", count: 0 },
  { date: "2026-11-12", count: 3 },
  { date: "2026-11-13", count: 1 },
  { date: "2026-11-14", count: 0 },
  { date: "2026-11-15", count: 0 },
];

describe("weekBars", () => {
  const bars = weekBars(WEEK, "2026-11-12");

  it("marca o que passou, hoje e o que vem", () => {
    expect(bars.map((bar) => bar.state)).toEqual([
      "past",
      "past",
      "past",
      "today",
      "future",
      "future",
      "future",
    ]);
  });

  it("a altura é proporcional ao dia mais cheio", () => {
    expect(bars.map((bar) => bar.height)).toEqual([100, 50, 0, 75, 25, 0, 0]);
  });

  it("semana sem atendimentos tem todas as alturas zeradas", () => {
    const empty = weekBars(
      WEEK.map((item) => ({ ...item, count: 0 })),
      "2026-11-12",
    );
    expect(empty.every((bar) => bar.height === 0)).toBe(true);
  });

  it("o rótulo traz o dia da semana e o do mês", () => {
    expect(bars[0]).toMatchObject({ weekday: "seg", day: "9" });
    expect(bars[6]).toMatchObject({ weekday: "dom", day: "15" });
  });
});

describe("weekDescription e weekTotal", () => {
  it("descrevem o gráfico em texto e somam a semana", () => {
    expect(weekDescription(weekBars(WEEK, "2026-11-12"))).toContain(
      "seg 9: 4; ter 10: 2",
    );
    expect(weekTotal(WEEK)).toBe(10);
  });
});

describe("comparison", () => {
  it("diz se subiu, desceu ou ficou igual", () => {
    expect(comparison(8, 5)).toEqual({
      text: "+3 que no mês anterior",
      tone: "up",
    });
    expect(comparison(2, 5)).toEqual({
      text: "−3 que no mês anterior",
      tone: "down",
    });
    expect(comparison(5, 5)).toEqual({
      text: "Igual ao mês anterior",
      tone: "same",
    });
  });
});

describe("attendanceCount", () => {
  it("usa o singular só para um", () => {
    expect(attendanceCount(1)).toBe("1 atendimento");
    expect(attendanceCount(0)).toBe("0 atendimentos");
    expect(attendanceCount(3)).toBe("3 atendimentos");
  });
});
