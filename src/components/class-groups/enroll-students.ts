import type { EnrollRefusal } from "@/app/(admin)/class-session-actions";
import type { PickedStudent } from "@/components/class-groups/StudentPicker";

/**
 * Encaixe em lote recusado (tudo ou nada): cada aluno da lista recebe o motivo
 * da recusa dele, ou fica sem motivo se não foi ele o recusado. A lista se
 * mantém, para o usuário tirar quem foi recusado e tentar de novo.
 */
export function withRefusals(
  students: PickedStudent[],
  refusals: EnrollRefusal[],
): PickedStudent[] {
  return students.map((student) => ({
    ...student,
    error: refusals.find((refusal) => refusal.clientId === student.id)?.message,
  }));
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
