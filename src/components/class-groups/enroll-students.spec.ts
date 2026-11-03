import { describe, expect, it } from "vitest";
import {
  capacityShortage,
  datesShortage,
  failedOutcomes,
  failureSummary,
  refusalsOfFailures,
  studentsLabel,
  withRefusals,
} from "@/components/class-groups/enroll-students";

describe("withRefusals", () => {
  it("põe o motivo em quem foi recusado e limpa os demais", () => {
    const listed = [
      { id: "a", name: "Ana", error: "motivo antigo" },
      { id: "b", name: "Bruno" },
      { id: "c", name: "Carla" },
    ];
    expect(
      withRefusals(listed, [
        { clientId: "b", message: "O cliente já está nesta sessão" },
      ]),
    ).toEqual([
      { id: "a", name: "Ana", error: undefined },
      { id: "b", name: "Bruno", error: "O cliente já está nesta sessão" },
      { id: "c", name: "Carla", error: undefined },
    ]);
  });
});

describe("capacityShortage", () => {
  it("cabem todos: sem aviso", () => {
    expect(capacityShortage(4, 4)).toBeUndefined();
    expect(capacityShortage(4, 2)).toBeUndefined();
  });

  it("falta vaga: diz quantos tirar", () => {
    expect(capacityShortage(4, 5)).toBe(
      "A sessão tem 4 vagas livres e há 5 alunos na lista. Tire 1 aluno ou aumente as vagas.",
    );
    expect(capacityShortage(1, 3)).toBe(
      "A sessão tem 1 vaga livre e há 3 alunos na lista. Tire 2 alunos ou aumente as vagas.",
    );
  });
});

describe("studentsLabel", () => {
  it("usa singular e plural", () => {
    expect(studentsLabel(1)).toBe("1 aluno");
    expect(studentsLabel(3)).toBe("3 alunos");
  });
});

describe("datesShortage", () => {
  it("cabem em todas as datas: sem aviso", () => {
    expect(
      datesShortage(
        [
          { label: "terça, 10/11 às 09:00", available: 4 },
          { label: "quinta, 12/11 às 09:00", available: 2 },
        ],
        2,
      ),
    ).toBeUndefined();
  });

  it("aponta a primeira data sem vaga para a lista inteira", () => {
    expect(
      datesShortage(
        [
          { label: "terça, 10/11 às 09:00", available: 4 },
          { label: "quinta, 12/11 às 09:00", available: 1 },
          { label: "terça, 17/11 às 09:00", available: 0 },
        ],
        2,
      ),
    ).toBe(
      "quinta, 12/11 às 09:00: A sessão tem 1 vaga livre e há 2 alunos na lista. Tire 1 aluno ou aumente as vagas.",
    );
  });
});

const outcomes = [
  { date: "2026-11-10", time: "09:00", ok: true as const },
  {
    date: "2026-11-12",
    time: "09:00",
    ok: false as const,
    message: "Conflito",
    refusals: [{ clientId: "b", message: "O cliente já está nesta sessão" }],
  },
  {
    date: "2026-11-17",
    time: "09:00",
    ok: false as const,
    message: "Agenda ocupada",
    refusals: [
      { clientId: "b", message: "Agenda ocupada" },
      { clientId: "c", message: "Agenda ocupada" },
    ],
  },
];
const labelOf = (outcome: { date: string; time: string }) => outcome.date;

describe("failedOutcomes", () => {
  it("separa as datas recusadas das que entraram", () => {
    expect(failedOutcomes(outcomes).map((item) => item.date)).toEqual([
      "2026-11-12",
      "2026-11-17",
    ]);
  });
});

describe("refusalsOfFailures", () => {
  it("fica com a primeira recusa de cada aluno, com a data no motivo", () => {
    expect(refusalsOfFailures(failedOutcomes(outcomes), labelOf)).toEqual([
      { clientId: "b", message: "2026-11-12: O cliente já está nesta sessão" },
      { clientId: "c", message: "2026-11-17: Agenda ocupada" },
    ]);
  });
});

describe("failureSummary", () => {
  it("mostra a primeira recusa e quantas outras houve", () => {
    expect(failureSummary(failedOutcomes(outcomes), labelOf)).toBe(
      "2026-11-12: Conflito (e mais 1 data)",
    );
  });

  it("uma data só: sem o complemento", () => {
    expect(failureSummary(failedOutcomes(outcomes).slice(0, 1), labelOf)).toBe(
      "2026-11-12: Conflito",
    );
  });

  it("sem falhas, texto vazio", () => {
    expect(failureSummary([], labelOf)).toBe("");
  });
});
