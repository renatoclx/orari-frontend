import { describe, expect, it } from "vitest";
import { computeGridRange, gridAreas } from "@/components/agenda/agenda-range";
import { minutesToTime } from "@/utils/time";

const range = (start: string, end: string) => ({ start, end });
const asTimes = (r: { start: number; end: number }) => [
  minutesToTime(r.start),
  minutesToTime(r.end),
];

describe("computeGridRange", () => {
  it("vai da abertura menos 2 horas ao fechamento mais 2 horas", () => {
    expect(asTimes(computeGridRange([range("08:00", "18:00")], []))).toEqual([
      "06:00",
      "20:00",
    ]);
  });

  it("usa a abertura mais cedo e o fechamento mais tarde entre as janelas", () => {
    expect(
      asTimes(
        computeGridRange(
          [range("12:00", "18:00"), range("08:00", "10:00")],
          [],
        ),
      ),
    ).toEqual(["06:00", "20:00"]);
  });

  it("sem horário nem agendamento, usa a janela padrão (07:00 às 20:00)", () => {
    expect(asTimes(computeGridRange([], []))).toEqual(["07:00", "20:00"]);
  });

  it("agendamentos fora da janela a ampliam: nunca ficam de fora", () => {
    expect(
      asTimes(
        computeGridRange(
          [range("08:00", "18:00")],
          [range("05:15", "06:00"), range("20:10", "21:10")],
        ),
      ),
    ).toEqual(["05:00", "21:30"]);
  });

  it("alinha os limites aos intervalos de 30 minutos", () => {
    expect(asTimes(computeGridRange([range("08:10", "17:50")], []))).toEqual([
      "06:00",
      "20:00",
    ]);
  });

  it("não passa da meia-noite nem fica antes dela", () => {
    expect(asTimes(computeGridRange([range("01:00", "23:00")], []))).toEqual([
      "00:00",
      "24:00",
    ]);
  });
});

describe("gridAreas", () => {
  const visible = { start: 6 * 60, end: 20 * 60 };

  it("separa o fora do expediente do intervalo entre janelas", () => {
    const areas = gridAreas(
      [range("08:00", "12:00"), range("14:00", "18:00")],
      visible,
    );

    expect(areas.outside).toEqual([
      range("06:00", "08:00"),
      range("18:00", "20:00"),
    ]);
    expect(areas.breaks).toEqual([range("12:00", "14:00")]);
  });

  it("sem horário no dia (empresa fechada), tudo é fora do expediente", () => {
    expect(gridAreas([], visible)).toEqual({
      outside: [range("06:00", "20:00")],
      breaks: [],
    });
  });

  it("janelas que se tocam ou se sobrepõem não têm intervalo", () => {
    expect(
      gridAreas([range("08:00", "12:00"), range("12:00", "18:00")], visible)
        .breaks,
    ).toEqual([]);
    expect(
      gridAreas([range("08:00", "12:00"), range("11:00", "15:00")], visible)
        .breaks,
    ).toEqual([]);
  });

  it("aceita as janelas fora de ordem", () => {
    const areas = gridAreas(
      [range("14:00", "18:00"), range("08:00", "12:00")],
      visible,
    );

    expect(areas.breaks).toEqual([range("12:00", "14:00")]);
  });

  it("quando o expediente já ocupa a grade, não sobra área de fora", () => {
    const areas = gridAreas([range("08:00", "18:00")], {
      start: 8 * 60,
      end: 18 * 60,
    });

    expect(areas.outside).toEqual([]);
    expect(areas.breaks).toEqual([]);
  });

  it("recorta o expediente à parte visível da grade", () => {
    const areas = gridAreas([range("08:00", "18:00")], {
      start: 9 * 60,
      end: 17 * 60,
    });

    expect(areas.outside).toEqual([]);
  });
});
