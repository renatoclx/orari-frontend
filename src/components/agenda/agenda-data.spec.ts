import { describe, expect, it } from "vitest";
import {
  OVERBOOKING_COLOR,
  toAgendaClassSessions,
} from "@/components/agenda/agenda-data";
import type { AgendaAppointment } from "@/types/agenda";
import type { ClassSessionAgendaItem } from "@/types/class-group";

// Dia 04/11/2026 em São Paulo (UTC-3): das 03:00Z às 03:00Z do dia seguinte.
const dayEnd = new Date("2026-11-05T03:00:00.000Z");
const TZ = "America/Sao_Paulo";

function item(
  overrides: Partial<ClassSessionAgendaItem> = {},
): ClassSessionAgendaItem {
  return {
    id: "sess-1",
    classGroup: { id: "g1", name: "Pilates 9h" },
    service: { id: "s1", name: "Pilates", color: "#22c55e", duration: 60 },
    professional: { id: "p1", name: "Camila", photoUrl: null },
    startAt: "2026-11-04T12:00:00.000Z",
    endAt: "2026-11-04T13:00:00.000Z",
    capacity: 4,
    occupied: 2,
    available: 2,
    overBooking: false,
    cancelledAt: null,
    cancellationNote: null,
    appointments: [],
    ...overrides,
  };
}

// Só o que o mapeamento usa do agendamento: o nome e a sessão.
const member = (id: string, clientName: string, sessionId: string) =>
  ({
    id,
    clientName,
    classSession: { id: sessionId },
  }) as AgendaAppointment;

describe("toAgendaClassSessions", () => {
  it("leva o horário para o fuso da empresa e junta os alunos da sessão", () => {
    const [session] = toAgendaClassSessions(
      [item()],
      [
        member("a", "Rodrigo", "sess-1"),
        member("b", "Fernanda", "sess-1"),
        member("c", "Outro", "sess-2"),
      ],
      TZ,
      dayEnd,
    );
    expect(session).toMatchObject({
      id: "sess-1",
      classGroupId: "g1",
      classGroupName: "Pilates 9h",
      start: "09:00",
      end: "10:00",
      serviceColor: "#22c55e",
      capacity: 4,
      occupied: 2,
    });
    expect(session.members.map((m) => m.clientName)).toEqual([
      "Fernanda",
      "Rodrigo",
    ]);
  });

  it("horário sem sessão vem vazio, e o encaixe usa a cor do encaixe", () => {
    const [session] = toAgendaClassSessions(
      [item({ id: null, occupied: 0, overBooking: true })],
      [member("a", "Rodrigo", "sess-1")],
      TZ,
      dayEnd,
    );
    expect(session.id).toBeNull();
    expect(session.members).toEqual([]);
    expect(session.serviceColor).toBe(OVERBOOKING_COLOR);
  });
});
