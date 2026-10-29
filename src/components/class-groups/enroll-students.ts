import type { ClassSessionResult } from "@/app/(admin)/class-session-actions";
import type { PickedStudent } from "@/components/class-groups/StudentPicker";
import type { ClassSessionItem } from "@/types/class-group";

export type EnrollOutcome = {
  /** Quantos entraram. */
  added: number;
  /** Quem não entrou, cada um com o motivo. */
  failed: PickedStudent[];
  /** A sessão depois do último encaixe que deu certo. */
  session?: ClassSessionItem;
};

/**
 * Encaixa os alunos um de cada vez, na ordem da lista. Em sequência (e não em
 * paralelo) porque cada encaixe pega a trava de vagas da sessão: com pouca
 * vaga, os primeiros da lista é que entram, de forma previsível.
 */
export async function enrollInOrder(
  students: PickedStudent[],
  enroll: (clientId: string) => Promise<ClassSessionResult>,
): Promise<EnrollOutcome> {
  const outcome: EnrollOutcome = { added: 0, failed: [] };
  for (const student of students) {
    const result = await enroll(student.id);
    if (result.ok) {
      outcome.added += 1;
      outcome.session = result.session;
    } else {
      outcome.failed.push({ ...student, error: result.message });
    }
  }
  return outcome;
}

/** "1 aluno" ou "3 alunos". */
export function studentsLabel(count: number) {
  return count === 1 ? "1 aluno" : `${count} alunos`;
}

/**
 * Falta de vaga para a lista inteira, conferida antes de qualquer encaixe: ou
 * entram todos, ou ninguém. Sem falta, devolve `undefined`.
 */
export function capacityShortage(available: number, selected: number) {
  if (selected <= available) return undefined;
  const free =
    available === 0
      ? "nenhuma vaga livre"
      : available === 1
        ? "1 vaga livre"
        : `${available} vagas livres`;
  return `A sessão tem ${free} e há ${studentsLabel(selected)} na lista. Tire ${studentsLabel(selected - available)} ou aumente as vagas.`;
}
