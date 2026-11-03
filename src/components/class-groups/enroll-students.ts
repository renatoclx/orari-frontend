import type {
  EnrollRefusal,
  EnrollSlotOutcome,
} from "@/app/(admin)/class-session-actions";
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

/**
 * Falta de vaga em alguma das datas escolhidas, conferida antes de qualquer
 * encaixe. Aponta a primeira data sem vaga para a lista inteira.
 */
export function datesShortage(
  slots: { label: string; available: number }[],
  selected: number,
) {
  for (const { label, available } of slots) {
    const shortage = capacityShortage(available, selected);
    if (shortage) return `${label}: ${shortage}`;
  }
  return undefined;
}

type FailedOutcome = Extract<EnrollSlotOutcome, { ok: false }>;

/** As datas em que o encaixe foi recusado. */
export function failedOutcomes(outcomes: EnrollSlotOutcome[]): FailedOutcome[] {
  return outcomes.filter((outcome): outcome is FailedOutcome => !outcome.ok);
}

/**
 * Recusas de todas as datas que falharam, uma por aluno (a primeira), com a
 * data no começo do motivo: a lista de alunos mostra um motivo só por nome.
 */
export function refusalsOfFailures(
  failures: FailedOutcome[],
  labelOf: (outcome: FailedOutcome) => string,
): EnrollRefusal[] {
  const byClient = new Map<string, EnrollRefusal>();
  for (const failure of failures) {
    for (const refusal of failure.refusals ?? []) {
      if (byClient.has(refusal.clientId)) continue;
      byClient.set(refusal.clientId, {
        clientId: refusal.clientId,
        message: `${labelOf(failure)}: ${refusal.message}`,
      });
    }
  }
  return [...byClient.values()];
}

/** Motivo da primeira data recusada e quantas outras também foram. */
export function failureSummary(
  failures: FailedOutcome[],
  labelOf: (outcome: FailedOutcome) => string,
) {
  const [first, ...others] = failures;
  if (!first) return "";
  const rest =
    others.length > 0
      ? ` (e mais ${others.length} ${others.length === 1 ? "data" : "datas"})`
      : "";
  return `${labelOf(first)}: ${first.message}${rest}`;
}
