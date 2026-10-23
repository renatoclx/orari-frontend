import { describe, expect, it } from "vitest";
import {
  PERIODS,
  availableOverbookingStarts,
  availableStarts,
  periodOf,
} from "@/components/agenda/agenda-availability";
import { minutesToTime } from "@/utils/time";

// Atalho de leitura: os minutos viram "HH:MM" nas comparações.
const times = (minutes: number[]) => minutes.map(minutesToTime);

describe("periodOf", () => {
  it("manhã até 11:59, tarde de 12:00 a 17:59, noite a partir das 18:00", () => {
    expect(periodOf(0)).toBe("morning");
    expect(periodOf(11 * 60 + 59)).toBe("morning");
    expect(periodOf(12 * 60)).toBe("afternoon");
    expect(periodOf(17 * 60 + 59)).toBe("afternoon");
    expect(periodOf(18 * 60)).toBe("night");
    expect(periodOf(23 * 60 + 59)).toBe("night");
  });

  it("os períodos aparecem na ordem do dia", () => {
    expect(PERIODS.map((period) => period.id)).toEqual([
      "morning",
      "afternoon",
      "night",
    ]);
  });
});

describe("availableStarts", () => {
  const morning = [{ start: "09:00", end: "12:00" }];

  it("oferece a grade de 15 minutos em que o serviço cabe inteiro na janela", () => {
    const starts = availableStarts({
      windows: morning,
      busy: [],
      duration: 60,
      notBefore: 0,
    });

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

  it("não oferece horário em que o atendimento passaria do fim da janela", () => {
    const starts = availableStarts({
      windows: morning,
      busy: [],
      duration: 60,
      notBefore: 0,
    });

    expect(times(starts)).not.toContain("11:15");
  });

  it("o último horário é o que termina exatamente no fechamento", () => {
    const starts = availableStarts({
      windows: morning,
      busy: [],
      duration: 30,
      notBefore: 0,
    });

    expect(times(starts).at(-1)).toBe("11:30");
  });

  it("tira os horários que sobrepõem um agendamento do profissional", () => {
    const starts = availableStarts({
      windows: morning,
      busy: [{ start: "10:00", end: "11:00" }],
      duration: 60,
      notBefore: 0,
    });

    // Termina às 10:00 ou começa às 11:00: encostar não é sobrepor.
    expect(times(starts)).toEqual(["09:00", "11:00"]);
  });

  it("oferece o horário logo depois de um agendamento, mesmo fora da grade", () => {
    const starts = availableStarts({
      windows: morning,
      busy: [{ start: "09:00", end: "09:10" }],
      duration: 20,
      notBefore: 0,
    });

    expect(times(starts)).toContain("09:10");
  });

  it("a janela que não começa na grade também oferece o seu primeiro minuto", () => {
    const starts = availableStarts({
      windows: [{ start: "09:10", end: "10:00" }],
      busy: [],
      duration: 30,
      notBefore: 0,
    });

    expect(times(starts)).toEqual(["09:10", "09:15", "09:30"]);
  });

  it("o atendimento não atravessa o intervalo entre duas janelas", () => {
    const starts = availableStarts({
      windows: [
        { start: "08:00", end: "12:00" },
        { start: "14:00", end: "18:00" },
      ],
      busy: [],
      duration: 60,
      notBefore: 0,
    });

    expect(times(starts)).toContain("11:00");
    expect(times(starts)).not.toContain("11:15");
    expect(times(starts)).not.toContain("12:00");
    expect(times(starts)).not.toContain("13:00");
    expect(times(starts)).toContain("14:00");
  });

  it("serviço maior que a janela não tem horário", () => {
    expect(
      availableStarts({
        windows: morning,
        busy: [],
        duration: 4 * 60,
        notBefore: 0,
      }),
    ).toEqual([]);
  });

  it("sem janela (dia fechado) não há horário comum", () => {
    expect(
      availableStarts({ windows: [], busy: [], duration: 30, notBefore: 0 }),
    ).toEqual([]);
  });

  it("não oferece o passado: vale a partir de notBefore, inclusive", () => {
    const starts = availableStarts({
      windows: morning,
      busy: [],
      duration: 30,
      notBefore: 10 * 60,
    });

    expect(times(starts)[0]).toBe("10:00");
    expect(times(starts)).not.toContain("09:45");
  });

  it("devolve os horários em ordem crescente e sem repetir", () => {
    const starts = availableStarts({
      windows: morning,
      busy: [{ start: "09:00", end: "09:30" }],
      duration: 30,
      notBefore: 0,
    });

    expect(starts).toEqual([...new Set(starts)].sort((a, b) => a - b));
    // 09:30 é a grade e também o fim do agendamento: aparece uma vez só.
    expect(starts.filter((start) => start === 9 * 60 + 30)).toHaveLength(1);
  });
});

describe("availableOverbookingStarts", () => {
  const workday = [{ start: "08:00", end: "18:00" }];

  it("só oferece o que fica inteiro fora das janelas de atendimento", () => {
    const starts = availableOverbookingStarts({
      windows: workday,
      busy: [],
      duration: 30,
      notBefore: 0,
    });

    // Antes da abertura: precisa terminar às 08:00.
    expect(times(starts)).toContain("00:00");
    expect(times(starts)).toContain("07:30");
    expect(times(starts)).not.toContain("07:45");
    // Depois do fechamento.
    expect(times(starts)).toContain("18:00");
    expect(times(starts)).not.toContain("17:45");
    expect(times(starts)).not.toContain("12:00");
  });

  it("termina até a meia-noite", () => {
    const starts = availableOverbookingStarts({
      windows: workday,
      busy: [],
      duration: 30,
      notBefore: 0,
    });

    expect(times(starts)).toContain("23:30");
    expect(times(starts)).not.toContain("23:45");
  });

  it("o intervalo entre janelas (almoço) aceita encaixe se couber inteiro", () => {
    const starts = availableOverbookingStarts({
      windows: [
        { start: "08:00", end: "12:00" },
        { start: "14:00", end: "18:00" },
      ],
      busy: [],
      duration: 60,
      notBefore: 0,
    });

    expect(times(starts)).toContain("12:00");
    expect(times(starts)).toContain("13:00");
    expect(times(starts)).not.toContain("13:15");
  });

  it("sem janela, o dia todo é encaixe", () => {
    const starts = availableOverbookingStarts({
      windows: [],
      busy: [],
      duration: 60,
      notBefore: 0,
    });

    expect(times(starts)[0]).toBe("00:00");
    expect(times(starts)).toContain("23:00");
  });

  it("respeita os agendamentos do profissional e o passado", () => {
    const starts = availableOverbookingStarts({
      windows: workday,
      busy: [{ start: "19:00", end: "20:00" }],
      duration: 60,
      notBefore: 18 * 60 + 30,
    });

    // 18:00 é passado. 18:30 a 19:45 sobrepõem o agendamento das 19:00.
    expect(times(starts)).not.toContain("18:00");
    expect(times(starts)).not.toContain("18:30");
    expect(times(starts)).not.toContain("19:30");
    // O primeiro horário livre é o fim do agendamento.
    expect(times(starts)[0]).toBe("20:00");
  });
});
