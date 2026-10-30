import { describe, expect, it } from "vitest";
import { splitClassSessions } from "@/components/agenda/class-session-blocks";
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
    cancelReason: null,
    ...overrides,
  };
}

const session = {
  id: "sess-1",
  classGroupId: "g1",
  capacity: 5,
  cancelledAt: null,
};

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
        classSession: {
          id: "sess-2",
          classGroupId: null,
          capacity: 2,
          cancelledAt: null,
        },
        start: "09:00",
      }),
    ]);
    expect(sessions.map((s) => s.id)).toEqual(["sess-1", "sess-2"]);
  });
});
