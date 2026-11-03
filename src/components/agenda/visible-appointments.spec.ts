import { describe, expect, it } from "vitest";
import type { AgendaClassSession } from "@/components/agenda/class-session-blocks";
import { visibleAppointments } from "@/components/agenda/visible-appointments";
import type { AgendaAppointment } from "@/types/agenda";

function single(
  id: string,
  overrides: Partial<AgendaAppointment> = {},
): AgendaAppointment {
  return {
    id,
    professionalId: "p1",
    clientId: `c-${id}`,
    serviceId: "s1",
    start: "09:00",
    end: "09:50",
    clientName: "Mateus",
    clientPhotoUrl: null,
    professionalName: "Camila",
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

function turma(occupied: number): AgendaClassSession {
  return {
    id: null,
    professionalId: "p1",
    classGroupId: "g1",
    classGroupName: "Turma de Pilates",
    start: "09:00",
    end: "09:50",
    serviceName: "Pilates",
    serviceColor: "#8B5CF6",
    durationMinutes: 50,
    professionalName: "Camila",
    capacity: 4,
    occupied,
    members: [],
    cancelledAt: null,
    cancellationNote: null,
  };
}

describe("visibleAppointments", () => {
  it("cancelado em horário livre aparece esmaecido", () => {
    const cancelled = single("a", { status: "CANCELLED" });
    expect(visibleAppointments([cancelled], [], "p1")).toEqual([cancelled]);
  });

  it("cancelado sobre turma vazia some (bug da turma sem alunos)", () => {
    const cancelled = single("a", { status: "CANCELLED" });
    expect(visibleAppointments([cancelled], [turma(0)], "p1")).toEqual([]);
  });

  it("cancelado sobre turma com alunos some", () => {
    const cancelled = single("a", { status: "CANCELLED" });
    expect(visibleAppointments([cancelled], [turma(2)], "p1")).toEqual([]);
  });

  it("turma de outro profissional não esconde o cancelado", () => {
    const cancelled = single("a", { status: "CANCELLED" });
    const other = { ...turma(0), professionalId: "p2" };
    expect(visibleAppointments([cancelled], [other], "p1")).toEqual([cancelled]);
  });

  it("ativo sempre aparece, mesmo sobre turma", () => {
    const active = single("a");
    expect(visibleAppointments([active], [turma(0)], "p1")).toEqual([active]);
  });

  it("só um dos cancelados do mesmo horário aparece", () => {
    const a = single("a", { status: "CANCELLED" });
    const b = single("b", { status: "CANCELLED" });
    expect(visibleAppointments([a, b], [], "p1")).toEqual([a]);
  });
});
