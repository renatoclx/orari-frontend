import "server-only";

import { apiFetch } from "@/services/api";
import type { AppointmentItem } from "@/types/appointment";
import type {
  ClassSessionAgendaItem,
  ClassSessionItem,
} from "@/types/class-group";

// Sessões de turma (só ADMIN): cada aluno tem o próprio agendamento, ligado à sessão.

/** A sessão com as vagas e os alunos. */
export function getClassSession(id: string): Promise<ClassSessionItem> {
  return apiFetch<ClassSessionItem>(`/class-sessions/${id}`);
}

/**
 * Agendamento que vira turma: cria a sessão avulsa com o horário, o serviço e
 * o profissional dele. As vagas contam o aluno do agendamento.
 */
export function createClassSession(
  appointmentId: string,
  capacity: number,
): Promise<ClassSessionItem> {
  return apiFetch<ClassSessionItem>("/class-sessions", {
    method: "POST",
    body: JSON.stringify({ appointmentId, capacity }),
  });
}

/** Vagas da sessão; a API recusa (409) abaixo do número de alunos. */
export function updateClassSessionCapacity(
  id: string,
  capacity: number,
): Promise<ClassSessionItem> {
  return apiFetch<ClassSessionItem>(`/class-sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ capacity }),
  });
}

/** Encaixa o cliente numa sessão existente; devolve o agendamento criado para ele. */
export function enrollInClassSession(
  id: string,
  clientId: string,
): Promise<AppointmentItem> {
  return apiFetch<AppointmentItem>(`/class-sessions/${id}/participants`, {
    method: "POST",
    body: JSON.stringify({ clientId }),
  });
}

/**
 * Encaixe na turma fixa: o início escolhe a sessão, criada no primeiro
 * encaixe daquele dia e horário. Devolve o agendamento criado para o aluno.
 */
export function enrollInClassGroup(
  classGroupId: string,
  clientId: string,
  startAt: string,
): Promise<AppointmentItem> {
  return apiFetch<AppointmentItem>(
    `/class-groups/${classGroupId}/participants`,
    {
      method: "POST",
      body: JSON.stringify({ clientId, startAt }),
    },
  );
}

/**
 * Agenda por sessão (from <= início < to, no máximo 31 dias): as sessões,
 * inclusive as canceladas, e os horários futuros das turmas fixas ainda sem
 * sessão. A API já tira os horários em que o profissional está ocupado.
 */
export function listClassSessions(params: {
  from: Date;
  to: Date;
  classGroupId?: string;
}): Promise<ClassSessionAgendaItem[]> {
  const query = new URLSearchParams({
    from: params.from.toISOString(),
    to: params.to.toISOString(),
  });
  if (params.classGroupId) query.set("classGroupId", params.classGroupId);
  return apiFetch<ClassSessionAgendaItem[]>(`/class-sessions?${query}`);
}

/** Cancela a sessão inteira (antes do início): os alunos têm a aula cancelada. */
export function cancelClassSession(
  id: string,
  note?: string,
): Promise<ClassSessionItem> {
  return apiFetch<ClassSessionItem>(`/class-sessions/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify(note ? { note } : {}),
  });
}
