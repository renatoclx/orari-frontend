import { describe, expect, it } from "vitest";
import {
  capacityShortage,
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
