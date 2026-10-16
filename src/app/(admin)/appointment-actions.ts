"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import {
  cancelAppointment,
  createAppointment,
  listAppointments,
  updateAppointment,
} from "@/services/appointment.service";
import { getCurrentUser } from "@/services/auth.service";
import { listBusinessHours } from "@/services/business-hour.service";
import { listPeople } from "@/services/people.service";
import type { TimeRange } from "@/types/agenda";
import {
  dayBounds,
  formatLongDate,
  isDateString,
  timeToMinutes,
  toDateString,
  toTimeString,
  weekDayOf,
} from "@/utils/time";

/** O que a tela precisa para calcular os horários de um profissional num dia. */
export type Availability = {
  /** Janelas de atendimento do dia da semana. */
  windows: TimeRange[];
  /** Agendamentos do profissional no dia (cancelados liberam o horário). */
  busy: TimeRange[];
  /** Primeiro minuto do dia ainda permitido: o passado não se agenda. */
  notBefore: number;
};

export type AvailabilityResult =
  { ok: true; availability: Availability } | ActionFailure;

/**
 * Janelas e agendamentos de um profissional em uma data, no fuso da empresa. A
 * tela cruza isso com a duração do serviço para listar os horários possíveis.
 */
export async function getAvailabilityAction(
  professionalId: string,
  date: string,
  /** Na alteração, o próprio agendamento não ocupa horário para ele mesmo. */
  ignoreAppointmentId?: string,
): Promise<AvailabilityResult> {
  if (!professionalId || !isDateString(date)) {
    return { ok: false, message: "Informe o profissional e a data." };
  }

  try {
    const { company } = await getCurrentUser();
    const timeZone = company.timezone;
    const today = toDateString(new Date(), timeZone);

    // Dia passado: nada a oferecer.
    if (date < today) {
      return {
        ok: true,
        availability: { windows: [], busy: [], notBefore: 24 * 60 },
      };
    }

    const bounds = dayBounds(date, timeZone);
    const [hours, appointments] = await Promise.all([
      listBusinessHours(weekDayOf(date)),
      listAppointments({ ...bounds, professionalId }),
    ]);

    const nowTime = toTimeString(new Date().toISOString(), timeZone);
    return {
      ok: true,
      availability: {
        windows: hours.map((item) => ({
          start: item.openAt,
          end: item.closeAt,
        })),
        busy: appointments
          .filter(
            (item) =>
              item.status !== "CANCELLED" && item.id !== ignoreAppointmentId,
          )
          .map((item) => ({
            start: toTimeString(item.startAt, timeZone),
            // Atendimento que passa da meia-noite termina às 24:00.
            end:
              new Date(item.endAt).getTime() >= bounds.to.getTime()
                ? "24:00"
                : toTimeString(item.endAt, timeZone),
          })),
        // Hoje, só depois de agora (a API exige início futuro).
        notBefore: date === today ? timeToMinutes(nowTime) + 1 : 0,
      },
    };
  } catch (error) {
    return failureFrom(error);
  }
}

export type ClientOption = { id: string; name: string };
export type SearchClientsResult =
  { ok: true; clients: ClientOption[] } | ActionFailure;

/** Clientes ativos pelo nome, para o campo de busca do agendamento. */
export async function searchClientsAction(
  term: string,
): Promise<SearchClientsResult> {
  try {
    const result = await listPeople({
      type: "CLIENT",
      name: term,
      page: 1,
      limit: 20,
    });
    return {
      ok: true,
      clients: result.items
        .filter((client) => client.deletedAt === null)
        .map((client) => ({ id: client.id, name: client.name })),
    };
  } catch (error) {
    return failureFrom(error);
  }
}

export type CreateAppointmentInput = {
  clientId: string;
  professionalId: string;
  serviceId: string;
  /** Dia, "aaaa-mm-dd", e horário, "HH:mm", no fuso da empresa. */
  date: string;
  time: string;
  note: string;
  /** Encaixe: fora do horário de funcionamento (a API exige a autorização). */
  overBooking?: boolean;
};

export type CreateAppointmentResult =
  | {
      ok: true;
      /** Para o aviso de sucesso: dia por extenso e horário do atendimento. */
      dateLabel: string;
      start: string;
      end: string;
    }
  | ActionFailure<"time">;

/** Cria um agendamento comum. O fim é calculado pela API (início + duração). */
export async function createAppointmentAction(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  if (
    !input.clientId ||
    !input.professionalId ||
    !input.serviceId ||
    !isDateString(input.date) ||
    !/^\d{2}:\d{2}$/.test(input.time)
  ) {
    return { ok: false, message: "Preencha todos os campos obrigatórios." };
  }

  try {
    const { company } = await getCurrentUser();
    const timeZone = company.timezone;

    // Meia-noite do dia no fuso da empresa + o horário escolhido.
    const startAt = new Date(
      dayBounds(input.date, timeZone).from.getTime() +
        timeToMinutes(input.time) * 60_000,
    );

    const created = await createAppointment({
      clientId: input.clientId,
      professionalId: input.professionalId,
      serviceId: input.serviceId,
      startAt: startAt.toISOString(),
      ...(input.note.trim() && { note: input.note.trim() }),
      ...(input.overBooking && { overBooking: true }),
    });

    revalidatePath("/");
    return {
      ok: true,
      dateLabel: formatLongDate(new Date(`${input.date}T12:00:00Z`)),
      start: toTimeString(created.startAt, timeZone),
      end: toTimeString(created.endAt, timeZone),
    };
  } catch (error) {
    // O 409 é conflito de horário (do profissional ou do cliente).
    return failureFrom(error, "time" as const);
  }
}

export type CancelAppointmentResult = { ok: true } | ActionFailure;

/** Cancela o agendamento e atualiza a agenda. */
export async function cancelAppointmentAction(
  id: string,
): Promise<CancelAppointmentResult> {
  try {
    await cancelAppointment(id);
  } catch (error) {
    return failureFrom(error);
  }

  revalidatePath("/");
  return { ok: true };
}

export type UpdateAppointmentActionInput = {
  id: string;
  clientId?: string;
  professionalId?: string;
  serviceId?: string;
  /** Novo dia e horário (juntos), no fuso da empresa. */
  date?: string;
  time?: string;
  /** Texto vazio remove a observação. */
  note?: string;
  overBooking?: boolean;
};

export type UpdateAppointmentResult =
  | { ok: true; dateLabel: string; start: string; end: string }
  | ActionFailure<"time">;

/** Altera o agendamento: só os campos informados são enviados à API. */
export async function updateAppointmentAction(
  input: UpdateAppointmentActionInput,
): Promise<UpdateAppointmentResult> {
  const moves = input.date !== undefined || input.time !== undefined;
  if (
    moves &&
    (!input.date ||
      !isDateString(input.date) ||
      !input.time ||
      !/^\d{2}:\d{2}$/.test(input.time))
  ) {
    return { ok: false, message: "Informe a data e o horário." };
  }

  try {
    const { company } = await getCurrentUser();
    const timeZone = company.timezone;

    const updated = await updateAppointment(input.id, {
      ...(input.clientId && { clientId: input.clientId }),
      ...(input.professionalId && { professionalId: input.professionalId }),
      ...(input.serviceId && { serviceId: input.serviceId }),
      ...(moves && {
        // Meia-noite do dia no fuso da empresa + o horário escolhido.
        startAt: new Date(
          dayBounds(input.date as string, timeZone).from.getTime() +
            timeToMinutes(input.time as string) * 60_000,
        ).toISOString(),
      }),
      ...(input.note !== undefined && { note: input.note.trim() || null }),
      ...(input.overBooking && { overBooking: true }),
    });

    revalidatePath("/");
    return {
      ok: true,
      dateLabel: formatLongDate(new Date(updated.startAt)),
      start: toTimeString(updated.startAt, timeZone),
      end: toTimeString(updated.endAt, timeZone),
    };
  } catch (error) {
    // O 409 é conflito de horário (do profissional ou do cliente).
    return failureFrom(error, "time" as const);
  }
}
