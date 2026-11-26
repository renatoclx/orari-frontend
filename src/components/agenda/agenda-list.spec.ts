import { describe, expect, it } from "vitest";
import {
  agendaListEntries,
  currentEntryIndex,
} from "@/components/agenda/agenda-list";
import type { AgendaClassSession } from "@/components/agenda/class-session-blocks";
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
    serviceName: "Limpeza de pele",
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

function session(
  overrides: Partial<AgendaClassSession> = {},
): AgendaClassSession {
  return {
    id: "sess-1",
    professionalId: "p1",
    classGroupId: "g1",
    classGroupName: null,
    start: "10:00",
    end: "11:00",
    serviceName: "Pilates",
    serviceColor: "#22C55E",
    durationMinutes: 60,
    professionalName: "Camila",
    capacity: 4,
    occupied: 2,
    members: [],
    cancelledAt: null,
    cancellationNote: null,
    ...overrides,
  };
}

const professionals = [
  { id: "p1", name: "Camila" },
  { id: "p2", name: "Juliana" },
];
const keys = (entries: ReturnType<typeof agendaListEntries>) =>
  entries.map((entry) => entry.key);

describe("agendaListEntries", () => {
  it("junta todos os profissionais em ordem de horário", () => {
    const entries = agendaListEntries(
      professionals,
      [
        single("tarde", { start: "14:00", end: "14:50" }),
        single("cedo", { professionalId: "p2", start: "08:00", end: "08:50" }),
      ],
      [session()],
    );
    expect(keys(entries)).toEqual(["a-cedo", "s-sess-1", "a-tarde"]);
  });

  it("no mesmo horário, segue a ordem dos profissionais", () => {
    const entries = agendaListEntries(
      professionals,
      [single("da-juliana", { professionalId: "p2" }), single("da-camila")],
      [],
    );
    expect(keys(entries)).toEqual(["a-da-camila", "a-da-juliana"]);
  });

  it("os alunos da turma não aparecem um a um: só a sessão", () => {
    const aluno = single("aluno", {
      start: "10:00",
      end: "11:00",
      classSession: { id: "sess-1" } as AgendaAppointment["classSession"],
    });
    expect(
      keys(agendaListEntries(professionals, [aluno], [session()])),
    ).toEqual(["s-sess-1"]);
  });

  it("cancelado cujo horário foi reaproveitado não aparece, como na grade", () => {
    const entries = agendaListEntries(
      professionals,
      [single("cancelado", { status: "CANCELLED" }), single("novo")],
      [],
    );
    expect(keys(entries)).toEqual(["a-novo"]);
  });

  it("dia vazio: lista vazia", () => {
    expect(agendaListEntries(professionals, [], [])).toEqual([]);
  });
});

describe("currentEntryIndex", () => {
  const entries = agendaListEntries(
    professionals,
    [
      single("um", { start: "08:00", end: "08:50" }),
      single("dois", { start: "09:00", end: "09:50" }),
    ],
    [],
  );

  it("a primeira linha que ainda não terminou", () => {
    expect(currentEntryIndex(entries, 9 * 60 + 10)).toBe(1);
  });

  it("todas já passaram: -1", () => {
    expect(currentEntryIndex(entries, 12 * 60)).toBe(-1);
  });
});
