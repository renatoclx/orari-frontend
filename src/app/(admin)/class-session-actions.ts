"use server";

import { revalidatePath } from "next/cache";
import { capacityError } from "@/components/class-groups/class-group-rules";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import type { ApiError } from "@/services/api";
import { isUuid } from "@/lib/uuid";
import { getCurrentUser } from "@/services/auth.service";
import {
  cancelClassSession,
  createClassSession,
  enrollInClassGroup,
  enrollInClassSession,
  getClassSession,
  listClassSessions,
  updateClassSessionCapacity,
} from "@/services/class-session.service";
import type {
  ClassSessionItem,
  UpcomingClassSession,
} from "@/types/class-group";
import {
  dayBounds,
  isDateString,
  timeToMinutes,
  toDateString,
  toTimeString,
} from "@/utils/time";

export type ClassSessionResult =
  { ok: true; session: ClassSessionItem } | ActionFailure;

// Encaixes e vagas mudam a agenda (um agendamento por aluno) e a lista de turmas.
function revalidateClassScreens() {
  revalidatePath("/");
  revalidatePath("/turmas");
}

// Executa a chamada e devolve a sessão atualizada, ou a falha pronta para a tela.
async function run(
  ids: string[],
  call: () => Promise<ClassSessionItem>,
  revalidate = true,
): Promise<ClassSessionResult> {
  if (!ids.every(isUuid)) return { ok: false, message: "Dados inválidos." };
  try {
    const session = await call();
    if (revalidate) revalidateClassScreens();
    return { ok: true, session };
  } catch (error) {
    return failureFrom(error);
  }
}

/** Sessão com vagas e alunos, para o diálogo da agenda. */
export async function getClassSessionAction(
  id: string,
): Promise<ClassSessionResult> {
  return run([id], () => getClassSession(id), false);
}

/** Agendamento que vira turma, com as vagas informadas (2 ou mais). */
export async function createClassSessionAction(
  appointmentId: string,
  capacity: number,
): Promise<ClassSessionResult> {
  const message = capacityError(String(capacity));
  if (message) return { ok: false, message };
  return run([appointmentId], () =>
    createClassSession(appointmentId, capacity),
  );
}

/** Vagas da sessão (não abaixo do número de alunos, conferido pela API). */
export async function updateClassSessionCapacityAction(
  id: string,
  capacity: number,
): Promise<ClassSessionResult> {
  const message = capacityError(String(capacity));
  if (message) return { ok: false, message };
  return run([id], () => updateClassSessionCapacity(id, capacity));
}

/** Recusa de um cliente no encaixe em lote, com o motivo. */
export type EnrollRefusal = { clientId: string; message: string };

export type EnrollResult =
  | { ok: true; session: ClassSessionItem }
  | (ActionFailure & { refusals?: EnrollRefusal[] });

// Encaixe em lote: ou todos entram, ou a falha traz o motivo de cada recusado.
async function enroll(
  ids: string[],
  call: () => Promise<ClassSessionItem>,
): Promise<EnrollResult> {
  if (!ids.every(isUuid)) return { ok: false, message: "Dados inválidos." };
  try {
    const session = await call();
    revalidateClassScreens();
    return { ok: true, session };
  } catch (error) {
    const failure = failureFrom(error);
    const errors = (error as ApiError).body as { errors?: unknown } | undefined;
    return Array.isArray(errors?.errors)
      ? { ...failure, refusals: errors.errors as EnrollRefusal[] }
      : failure;
  }
}

/** Encaixe dos clientes numa sessão que já existe (tudo ou nada). */
export async function enrollInClassSessionAction(
  id: string,
  clientIds: string[],
): Promise<EnrollResult> {
  return enroll([id, ...clientIds], () => enrollInClassSession(id, clientIds));
}

/**
 * Encaixe na turma fixa, num dia ("aaaa-mm-dd") e horário ("HH:mm") da turma,
 * no fuso da empresa (tudo ou nada). A API confere se o horário é da turma.
 */
export async function enrollInClassGroupAction(
  classGroupId: string,
  clientIds: string[],
  date: string,
  time: string,
): Promise<EnrollResult> {
  if (!isDateString(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { ok: false, message: "Escolha a data da sessão." };
  }
  return enroll([classGroupId, ...clientIds], async () => {
    const { company } = await getCurrentUser();
    // Meia-noite do dia no fuso da empresa + o horário da turma.
    const startAt = new Date(
      dayBounds(date, company.timezone).from.getTime() +
        timeToMinutes(time) * 60_000,
    );
    return enrollInClassGroup(classGroupId, clientIds, startAt.toISOString());
  });
}

// Quantos dias à frente as próximas sessões cobrem (a API aceita até 31).
const UPCOMING_DAYS = 28;

export type UpcomingSessionsResult =
  { ok: true; sessions: UpcomingClassSession[] } | ActionFailure;

/**
 * Próximas sessões da turma fixa (4 semanas), com as vagas de cada uma,
 * inclusive os horários ainda sem sessão e as sessões canceladas.
 */
export async function listUpcomingSessionsAction(
  classGroupId: string,
): Promise<UpcomingSessionsResult> {
  if (!isUuid(classGroupId)) return { ok: false, message: "Dados inválidos." };
  try {
    const { company } = await getCurrentUser();
    const from = new Date();
    const to = new Date(from.getTime() + UPCOMING_DAYS * 24 * 60 * 60_000);
    const items = await listClassSessions({ from, to, classGroupId });
    return {
      ok: true,
      sessions: items.map((item) => ({
        id: item.id,
        date: toDateString(new Date(item.startAt), company.timezone),
        time: toTimeString(item.startAt, company.timezone),
        capacity: item.capacity,
        occupied: item.occupied,
        available: item.available,
        cancelledAt: item.cancelledAt,
        students: item.appointments
          .filter((student) => student.status !== "CANCELLED")
          .map((student) => student.client.name),
      })),
    };
  } catch (error) {
    return failureFrom(error);
  }
}

/** Cancela a sessão inteira; o motivo (opcional) fica registrado. */
export async function cancelClassSessionAction(
  id: string,
  note: string,
): Promise<ClassSessionResult> {
  return run([id], () => cancelClassSession(id, note.trim() || undefined));
}
