import { describe, expect, it } from "vitest";
import type { ProfessionalAgenda } from "@/types/professional-app";
import {
  buildEntries,
  parseDayParam,
  relativeDayLabel,
  shiftDay,
  summarizeEntries,
  timeOf,
  todayIn,
} from "./professional-agenda";

const TZ = "America/Sao_Paulo";

function appointment(
  overrides: Partial<ProfessionalAgenda["appointments"][number]> & {
    id: string;
    startAt: string;
  },
): ProfessionalAgenda["appointments"][number] {
  return {
    endAt: "2026-11-12T14:00:00.000Z",
    status: "SCHEDULED",
    note: null,
    overBooking: false,
    client: { id: `c-${overrides.id}`, name: "Ana" },
    service: {
      id: "s1",
      name: "Corte",
      color: "#3b82f6",
      duration: 30,
      price: 45,
    },
    recurrence: null,
    classSession: null,
    ...overrides,
  };
}

describe("parseDayParam", () => {
  it("aceita uma data que existe", () => {
    expect(parseDayParam("2026-11-12")).toBe("2026-11-12");
  });
  it("ignora formato errado, data inexistente e valor que não é texto", () => {
    expect(parseDayParam("12/11/2026")).toBeUndefined();
    expect(parseDayParam("2026-02-31")).toBeUndefined();
    expect(parseDayParam(["2026-11-12"])).toBeUndefined();
    expect(parseDayParam(undefined)).toBeUndefined();
  });
});

describe("shiftDay", () => {
  it("anda entre dias, virando o mês e o ano", () => {
    expect(shiftDay("2026-11-30", 1)).toBe("2026-12-01");
    expect(shiftDay("2027-01-01", -1)).toBe("2026-12-31");
  });
});

describe("todayIn", () => {
  it("usa o relógio da clínica, não o UTC", () => {
    // 01:00 UTC do dia 13 ainda é dia 12 em São Paulo (UTC-3).
    expect(todayIn(TZ, new Date("2026-11-13T01:00:00.000Z"))).toBe(
      "2026-11-12",
    );
  });
});

describe("relativeDayLabel", () => {
  it("nomeia ontem, hoje e amanhã", () => {
    expect(relativeDayLabel("2026-11-12", "2026-11-12")).toBe("Hoje");
    expect(relativeDayLabel("2026-11-13", "2026-11-12")).toBe("Amanhã");
    expect(relativeDayLabel("2026-11-11", "2026-11-12")).toBe("Ontem");
    expect(relativeDayLabel("2026-11-20", "2026-11-12")).toBeNull();
  });
});

describe("timeOf", () => {
  it("mostra HH:mm no relógio da clínica", () => {
    expect(timeOf("2026-11-12T12:30:00.000Z", TZ)).toBe("09:30");
  });
});

describe("buildEntries", () => {
  it("ordena por horário e junta os alunos da mesma sessão num cartão", () => {
    const agenda: ProfessionalAgenda = {
      day: "2026-11-12",
      appointments: [
        appointment({ id: "late", startAt: "2026-11-12T17:00:00.000Z" }),
        appointment({
          id: "m2",
          startAt: "2026-11-12T13:00:00.000Z",
          client: { id: "c2", name: "Zeca" },
          classSession: { id: "sess", capacity: 4, cancelledAt: null },
        }),
        appointment({
          id: "m1",
          startAt: "2026-11-12T13:00:00.000Z",
          client: { id: "c1", name: "Bia" },
          status: "CANCELLED",
          classSession: { id: "sess", capacity: 4, cancelledAt: null },
        }),
      ],
      blocks: [
        {
          id: "b1",
          startAt: "2026-11-12T15:00:00.000Z",
          endAt: "2026-11-12T16:00:00.000Z",
        },
      ],
    };

    const entries = buildEntries(agenda, TZ);

    expect(entries.map((entry) => entry.kind)).toEqual([
      "class",
      "block",
      "appointment",
    ]);
    const session = entries[0];
    if (session.kind !== "class") throw new Error("esperava a turma");
    // Os cancelados não ocupam vaga; os alunos saem em ordem alfabética.
    expect(session.occupied).toBe(1);
    expect(session.members.map((member) => member.name)).toEqual([
      "Bia",
      "Zeca",
    ]);
    expect(session.cancelled).toBe(false);
  });

  it("o atendimento avulso carrega o id do cliente, para levar à ficha", () => {
    const [entry] = buildEntries(
      {
        day: "2026-11-12",
        appointments: [
          appointment({ id: "a", startAt: "2026-11-12T12:00:00.000Z" }),
        ],
        blocks: [],
      },
      TZ,
    );
    expect(entry).toMatchObject({ kind: "appointment", clientId: "c-a" });
  });

  it("diz a origem: pacote, recorrente ou encaixe", () => {
    const agenda: ProfessionalAgenda = {
      day: "2026-11-12",
      appointments: [
        appointment({
          id: "a",
          startAt: "2026-11-12T12:00:00.000Z",
          recurrence: { isPackage: true },
        }),
        appointment({
          id: "b",
          startAt: "2026-11-12T13:00:00.000Z",
          recurrence: { isPackage: false },
        }),
        appointment({
          id: "c",
          startAt: "2026-11-12T14:00:00.000Z",
          overBooking: true,
        }),
        appointment({ id: "d", startAt: "2026-11-12T15:00:00.000Z" }),
      ],
      blocks: [],
    };
    const origins = buildEntries(agenda, TZ).map((entry) =>
      entry.kind === "appointment" ? entry.origin : "x",
    );
    expect(origins).toEqual(["package", "recurring", "overbooking", null]);
  });

  it("sessão cancelada pela clínica vem marcada", () => {
    const entries = buildEntries(
      {
        day: "2026-11-12",
        appointments: [
          appointment({
            id: "m",
            startAt: "2026-11-12T13:00:00.000Z",
            classSession: {
              id: "s",
              capacity: 4,
              cancelledAt: "2026-11-10T10:00:00.000Z",
            },
          }),
        ],
        blocks: [],
      },
      TZ,
    );
    expect(entries[0]).toMatchObject({ kind: "class", cancelled: true });
  });
});

describe("summarizeEntries", () => {
  const day = (appointments: ProfessionalAgenda["appointments"]) =>
    summarizeEntries(
      buildEntries({ day: "2026-11-12", appointments, blocks: [] }, TZ),
    );

  it("conta os atendimentos, sem os cancelados", () => {
    expect(day([])).toBe("Nenhum atendimento");
    expect(
      day([appointment({ id: "a", startAt: "2026-11-12T12:00:00.000Z" })]),
    ).toBe("1 atendimento");
    expect(
      day([
        appointment({ id: "a", startAt: "2026-11-12T12:00:00.000Z" }),
        appointment({
          id: "b",
          startAt: "2026-11-12T13:00:00.000Z",
          status: "CANCELLED",
        }),
        appointment({ id: "c", startAt: "2026-11-12T14:00:00.000Z" }),
      ]),
    ).toBe("2 atendimentos");
  });
});
