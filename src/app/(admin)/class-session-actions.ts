"use server";

import { revalidatePath } from "next/cache";
import { capacityError } from "@/components/class-groups/class-group-rules";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import { getCurrentUser } from "@/services/auth.service";
import {
  createClassSession,
  enrollInClassGroup,
  enrollInClassSession,
  getClassSession,
  updateClassSessionCapacity,
} from "@/services/class-session.service";
import type { ClassSessionItem } from "@/types/class-group";
import { dayBounds, isDateString, timeToMinutes } from "@/utils/time";

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

/** Encaixe do cliente numa sessão que já existe; devolve a sessão atualizada. */
export async function enrollInClassSessionAction(
  id: string,
  clientId: string,
): Promise<ClassSessionResult> {
  return run([id, clientId], async () => {
    await enrollInClassSession(id, clientId);
    return getClassSession(id);
  });
}

/**
 * Encaixe na turma fixa, num dia ("aaaa-mm-dd") e horário ("HH:mm") da turma,
 * no fuso da empresa. A API confere se o horário é mesmo da turma.
 */
export async function enrollInClassGroupAction(
  classGroupId: string,
  clientId: string,
  date: string,
  time: string,
): Promise<ClassSessionResult> {
  if (!isDateString(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { ok: false, message: "Escolha a data da sessão." };
  }
  return run([classGroupId, clientId], async () => {
    const { company } = await getCurrentUser();
    // Meia-noite do dia no fuso da empresa + o horário da turma.
    const startAt = new Date(
      dayBounds(date, company.timezone).from.getTime() +
        timeToMinutes(time) * 60_000,
    );
    // A API devolve o agendamento do aluno; a tela mostra as vagas da sessão.
    const appointment = await enrollInClassGroup(
      classGroupId,
      clientId,
      startAt.toISOString(),
    );
    return getClassSession(appointment.classSession!.id);
  });
}
