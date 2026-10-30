import { describe, expect, it } from "vitest";
import {
  splitClassSessions,
  withEmptyClassSessions,
  type AgendaClassSession,
} from "@/components/agenda/class-session-blocks";
import type { AgendaAppointment } from "@/types/agenda";

function appointment(
  id: string,
  clientName: string,
  overrides: Partial<AgendaAppointment> = {},
): AgendaAppointment {
  return {
    id,
    professionalId: "p1",
    clientId: `c-${id}`,
    serviceId: "s1",
    start: "08:00",
    end: "08:50",
    clientName,
    clientPhotoUrl: null,
    professionalName: "Beatriz",
    serviceName: "Pilates",
    serviceColor: "#8B5CF6",
    durationMinutes: 50,
    note: null,
    status: "SCHEDULED",
    overbooking: false,
    recurrence: null,
    paid: false,
    classSession: null,
    ...overrides,
  };
}

const session = { id: "sess-1", classGroupId: "g1", capacity: 5 };

describe("splitClassSessions", () => {
  it("deixa os agendamentos fora de turma como estão", () => {
    const single = appointment("a", "Ana");
    expect(splitClassSessions([single])).toEqual({
      singles: [single],
      sessions: [],
    });
  });

  it("junta os alunos da mesma sessão num bloco, em ordem alfabética", () => {
    const { singles, sessions } = splitClassSessions([
      appointment("a", "Vanessa", { classSession: session }),
      appointment("b", "Carolina", { classSession: session }),
      appointment("c", "Ana"),
    ]);

    expect(singles.map((s) => s.id)).toEqual(["c"]);
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({
      id: "sess-1",
      classGroupId: "g1",
      start: "08:00",
      capacity: 5,
      occupied: 2,
    });
    expect(sessions[0].members.map((m) => m.clientName)).toEqual([
      "Carolina",
      "Vanessa",
    ]);
  });

  it("não conta o cancelado nas vagas ocupadas, mas conta a falta", () => {
    const [block] = splitClassSessions([
      appointment("a", "Ana", { classSession: session, status: "CANCELLED" }),
      appointment("b", "Bia", { classSession: session, status: "NO_SHOW" }),
      appointment("c", "Cris", { classSession: session }),
    ]).sessions;

    expect(block.occupied).toBe(2);
    expect(block.members).toHaveLength(3);
  });

  it("separa sessões diferentes", () => {
    const { sessions } = splitClassSessions([
      appointment("a", "Ana", { classSession: session }),
      appointment("b", "Bia", {
        classSession: { id: "sess-2", classGroupId: null, capacity: 2 },
        start: "09:00",
      }),
    ]);
    expect(sessions.map((s) => s.id)).toEqual(["sess-1", "sess-2"]);
  });
});

// Horário de turma fixa ainda sem sessão (como vem de toEmptyClassSessions).
function emptySlot(
  overrides: Partial<AgendaClassSession> = {},
): AgendaClassSession {
  return {
    id: null,
    professionalId: "p1",
    classGroupId: "g1",
    start: "08:00",
    end: "08:50",
    serviceName: "Pilates",
    serviceColor: "#8B5CF6",
    durationMinutes: 50,
    professionalName: "Beatriz",
    capacity: 5,
    occupied: 0,
    members: [],
    ...overrides,
  };
}

describe("withEmptyClassSessions", () => {
  it("mostra o horário da turma que ainda não tem sessão", () => {
    const slot = emptySlot();
    expect(withEmptyClassSessions([], [slot], [])).toEqual([slot]);
  });

  it("descarta o horário que já tem sessão da mesma turma", () => {
    const { singles, sessions } = splitClassSessions([
      appointment("a", "Ana", { classSession: session }),
    ]);
    const result = withEmptyClassSessions(sessions, [emptySlot()], singles);
    expect(result.map((s) => s.id)).toEqual(["sess-1"]);
  });

  it("descarta o horário em que o profissional já atende", () => {
    const busy = appointment("a", "Ana", { start: "08:30", end: "09:20" });
    expect(withEmptyClassSessions([], [emptySlot()], [busy])).toEqual([]);
  });

  it("mantém o horário se o que está por baixo foi cancelado ou é de outro profissional", () => {
    const slot = emptySlot();
    const cancelled = appointment("a", "Ana", { status: "CANCELLED" });
    const other = appointment("b", "Bia", { professionalId: "p2" });
    expect(withEmptyClassSessions([], [slot], [cancelled, other])).toEqual([
      slot,
    ]);
  });
});
