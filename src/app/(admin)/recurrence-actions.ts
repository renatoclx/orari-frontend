"use server";

import { revalidatePath } from "next/cache";
import {
  addMonths,
  MAX_RECURRENCE_MONTHS,
} from "@/components/recurrences/recurrence-schedule";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import { getCurrentUser } from "@/services/auth.service";
import {
  cancelRecurrence,
  cancelRecurrenceSession,
  createRecurrence,
  getRecurrence,
  leaveClassGroup,
  listRecurrenceSessions,
  replaceInClassGroup,
  rescheduleRecurrenceSession,
  updateRecurrenceNote,
} from "@/services/recurrence.service";
import type {
  NewRecurrenceInput,
  RecurrenceItem,
  RecurrenceSession,
} from "@/types/recurrence";
import {
  dayBounds,
  isDateString,
  timeToMinutes,
  toDateString,
} from "@/utils/time";

export type RecurrenceActionResult = { ok: true } | ActionFailure;

export type GetRecurrenceResult =
  { ok: true; recurrence: RecurrenceItem } | ActionFailure;

/** Dados da recorrência (período, serviço, profissional), para remanejar pela agenda. */
export async function getRecurrenceAction(
  id: string,
): Promise<GetRecurrenceResult> {
  try {
    return { ok: true, recurrence: await getRecurrence(id) };
  } catch (error) {
    return failureFrom(error);
  }
}

export type RecurrenceSessionsResult =
  { ok: true; sessions: RecurrenceSession[] } | ActionFailure;

/** Sessões de uma recorrência (ex.: agenda de um serviço, no diálogo da contratação). */
export async function listRecurrenceSessionsAction(
  id: string,
): Promise<RecurrenceSessionsResult> {
  try {
    return { ok: true, sessions: await listRecurrenceSessions(id) };
  } catch (error) {
    return failureFrom(error);
  }
}

export type CreateRecurrenceResult = { ok: true; id: string } | ActionFailure;

/** Cadastra a recorrência (tudo ou nada: se uma sessão não couber, nenhuma é criada). */
export async function createRecurrenceAction(
  input: NewRecurrenceInput,
): Promise<CreateRecurrenceResult> {
  try {
    const { company } = await getCurrentUser();
    const today = toDateString(new Date(), company.timezone);

    if (!isDateString(input.startDate) || !isDateString(input.endDate)) {
      return { ok: false, message: "Informe as datas inicial e final." };
    }
    if (input.startDate < today) {
      return { ok: false, message: "A data inicial não pode ser no passado." };
    }
    if (input.endDate < input.startDate) {
      return {
        ok: false,
        message: "A data final não pode ser anterior à inicial.",
      };
    }
    if (input.endDate > addMonths(input.startDate, MAX_RECURRENCE_MONTHS)) {
      return {
        ok: false,
        message: `O período máximo é de ${MAX_RECURRENCE_MONTHS} meses.`,
      };
    }
    if (input.days.length === 0) {
      return { ok: false, message: "Escolha ao menos um dia da semana." };
    }

    const created = await createRecurrence(input);
    revalidatePath("/recorrencias");
    revalidatePath("/");
    return { ok: true, id: created.id };
  } catch (error) {
    return failureFrom(error);
  }
}

// Executa a operação, atualiza as telas que mostram a recorrência e devolve o resultado.
async function run(
  id: string,
  operation: () => Promise<void>,
): Promise<RecurrenceActionResult> {
  try {
    await operation();
    revalidatePath("/recorrencias");
    revalidatePath(`/recorrencias/${id}`);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function cancelRecurrenceAction(id: string) {
  return run(id, () => cancelRecurrence(id));
}

export async function cancelRecurrenceSessionAction(
  id: string,
  sessionId: string,
) {
  return run(id, () => cancelRecurrenceSession(id, sessionId));
}

/** Remanejamento: nova data e horário de início; o fim vem da duração do serviço. */
export async function rescheduleRecurrenceSessionAction(
  id: string,
  sessionId: string,
  date: string,
  time: string,
) {
  const { company } = await getCurrentUser();
  // Meia-noite do dia no fuso da empresa + o horário escolhido.
  const start = new Date(
    dayBounds(date, company.timezone).from.getTime() +
      timeToMinutes(time) * 60_000,
  );
  return run(id, () =>
    rescheduleRecurrenceSession(id, sessionId, start.toISOString()),
  );
}

export async function updateRecurrenceNoteAction(id: string, note: string) {
  return run(id, () => updateRecurrenceNote(id, note.trim() || null));
}

/** Saída da turma, com o motivo (opcional). */
export async function leaveClassGroupAction(id: string, note: string) {
  return run(id, () => leaveClassGroup(id, note.trim() || undefined));
}

/** Reposição numa sessão de turma: dia ("aaaa-mm-dd") e horário dela, no fuso da empresa. */
export async function replaceInClassGroupAction(
  id: string,
  sessionId: string,
  classGroupId: string,
  date: string,
  time: string,
) {
  if (![id, sessionId, classGroupId].every(isUuid) || !isDateString(date)) {
    return { ok: false as const, message: "Dados inválidos." };
  }
  const { company } = await getCurrentUser();
  const start = new Date(
    dayBounds(date, company.timezone).from.getTime() +
      timeToMinutes(time) * 60_000,
  );
  return run(id, () =>
    replaceInClassGroup(id, sessionId, classGroupId, start.toISOString()),
  );
}
