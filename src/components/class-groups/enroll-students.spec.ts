import { describe, expect, it } from "vitest";
import {
  capacityShortage,
  enrollInOrder,
  studentsLabel,
} from "@/components/class-groups/enroll-students";
import type { ClassSessionItem } from "@/types/class-group";

const students = [
  { id: "a", name: "Ana" },
  { id: "b", name: "Bruno" },
  { id: "c", name: "Carla" },
];

// Só o que o teste confere: as vagas ocupadas.
const session = (occupied: number) => ({ occupied }) as ClassSessionItem;

describe("enrollInOrder", () => {
  it("encaixa na ordem da lista, um de cada vez", async () => {
    const calls: string[] = [];
    const outcome = await enrollInOrder(students, async (clientId) => {
      calls.push(clientId);
      return { ok: true, session: session(calls.length) };
    });
    expect(calls).toEqual(["a", "b", "c"]);
    expect(outcome).toEqual({ added: 3, failed: [], session: session(3) });
  });

  it("segue depois de uma recusa e guarda o motivo de quem não entrou", async () => {
    const outcome = await enrollInOrder(students, async (clientId) =>
      clientId === "b"
        ? { ok: false, message: "Já está na sessão." }
        : { ok: true, session: session(clientId === "a" ? 1 : 2) },
    );
    expect(outcome.added).toBe(2);
    expect(outcome.failed).toEqual([
      { id: "b", name: "Bruno", error: "Já está na sessão." },
    ]);
    expect(outcome.session).toEqual(session(2));
  });

  it("sem nenhum encaixe, não há sessão", async () => {
    const outcome = await enrollInOrder(students, async () => ({
      ok: false,
      message: "A sessão está cheia.",
    }));
    expect(outcome.added).toBe(0);
    expect(outcome.failed).toHaveLength(3);
    expect(outcome.session).toBeUndefined();
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
