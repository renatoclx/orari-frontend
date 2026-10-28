"use server";

import { revalidatePath } from "next/cache";
import { toAgendaAppointment } from "@/components/agenda/agenda-data";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import {
  cancelAppointment,
  markAppointmentNoShow,
  createAppointment,
  getAppointment,
  listAppointments,
  updateAppointment,
} from "@/services/appointment.service";
import { getCurrentUser } from "@/services/auth.service";
import {
  listAllBusinessHours,
  listBusinessHours,
} from "@/services/business-hour.service";
import { listPeople } from "@/services/people.service";
import type { AgendaAppointment, TimeRange } from "@/types/agenda";
import type { WeekDay } from "@/types/business-hour";
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

/**
 * O que a tela precisa para achar horários livres em TODAS as datas de um
 * período (recorrência e contratação de pacote).
 */
export type PeriodAvailability = {
  /** Janelas de atendimento de cada dia da semana. */
  windows: Partial<Record<WeekDay, TimeRange[]>>;
  /** Horários ocupados por data ("aaaa-mm-dd"): profissional e cliente. */
  busy: Record<string, TimeRange[]>;
  /** Hoje e agora no fuso da empresa: o passado não se agenda. */
  today: string;
  nowMinutes: number;
};

export type PeriodAvailabilityResult =
  { ok: true; availability: PeriodAvailability } | ActionFailure;

/**
 * Janelas da semana e agendamentos (não cancelados) do profissional e do
 * cliente entre `startDate` e `endDate`, no fuso da empresa. A tela cruza isso
 * para oferecer só horários livres em todas as datas do período.
 */
export async function getPeriodAvailabilityAction(input: {
  professionalId: string;
  clientId: string;
  startDate: string;
  endDate: string;
}): Promise<PeriodAvailabilityResult> {
  const { professionalId, clientId, startDate, endDate } = input;
  if (
    !professionalId ||
    !clientId ||
    !isDateString(startDate) ||
    !isDateString(endDate) ||
    endDate < startDate
  ) {
    return {
      ok: false,
      message: "Informe o cliente, o profissional e o período.",
    };
  }

  try {
    const { company } = await getCurrentUser();
    const timeZone = company.timezone;
    const period = {
      from: dayBounds(startDate, timeZone).from,
      to: dayBounds(endDate, timeZone).to,
    };
    const [hours, ofProfessional, ofClient] = await Promise.all([
      listAllBusinessHours(),
      listAppointments({ ...period, professionalId }),
      listAppointments({ ...period, clientId }),
    ]);

    const windows: PeriodAvailability["windows"] = {};
    for (const hour of hours) {
      (windows[hour.weekDay] ??= []).push({
        start: hour.openAt,
        end: hour.closeAt,
      });
    }

    // Cada agendamento ocupa a sua data; o que passa da meia-noite vai até 24:00.
    const busy: PeriodAvailability["busy"] = {};
    for (const item of [...ofProfessional, ...ofClient]) {
      if (item.status === "CANCELLED") continue;
      const date = toDateString(new Date(item.startAt), timeZone);
      const sameDay = toDateString(new Date(item.endAt), timeZone) === date;
      (busy[date] ??= []).push({
        start: toTimeString(item.startAt, timeZone),
        end: sameDay ? toTimeString(item.endAt, timeZone) : "24:00",
      });
    }

    const now = new Date();
    return {
      ok: true,
      availability: {
        windows,
        busy,
        today: toDateString(now, timeZone),
        nowMinutes: timeToMinutes(toTimeString(now.toISOString(), timeZone)),
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

export type MarkNoShowResult = { ok: true } | ActionFailure;

/** Marca a falta do atendimento; o backend cancela o pagamento pendente dele. */
export async function markNoShowAction(id: string): Promise<MarkNoShowResult> {
  // O id vem do navegador: fora do formato, nem chega à API.
  if (!isUuid(id)) return { ok: false, message: "Pedido inválido." };
  try {
    await markAppointmentNoShow(id);
  } catch (error) {
    return failureFrom(error);
  }

  // Muda a agenda e o financeiro (o pagamento pendente é cancelado).
  revalidatePath("/");
  revalidatePath("/financeiro");
  revalidatePath("/financeiro/comandas");
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

export type AppointmentDetailsResult =
  { ok: true; appointment: AgendaAppointment; date: string } | ActionFailure;

/** Um agendamento no formato da agenda e o seu dia, para o dialog de detalhes. */
export async function getAppointmentDetailsAction(
  id: string,
): Promise<AppointmentDetailsResult> {
  try {
    const [{ company }, item] = await Promise.all([
      getCurrentUser(),
      getAppointment(id),
    ]);
    const date = toDateString(new Date(item.startAt), company.timezone);
    return {
      ok: true,
      date,
      appointment: toAgendaAppointment(
        item,
        company.timezone,
        dayBounds(date, company.timezone).to,
      ),
    };
  } catch (error) {
    return failureFrom(error);
  }
}
