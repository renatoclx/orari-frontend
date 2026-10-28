import type { AppointmentStatus } from "@/types/appointment";
import { timeToMinutes } from "@/utils/time";

// Onde a falta ainda pode ser marcada; o backend confere de novo. Cancelado e o
// que já é falta são estados finais.
const NO_SHOW_FROM: AppointmentStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

/**
 * A falta (o cliente não compareceu) só se marca depois de o atendimento
 * iniciar: em andamento ou concluído, ou ainda agendado/confirmado com o
 * horário de início já passado (o status é atualizado a cada 5 minutos, então
 * vale o horário), e não foi pago. Mesma regra do backend, que decide: se o
 * pagamento for recebido no meio do caminho, ele recusa e a tela mostra o motivo.
 *
 * @param appointment status, horário de início ("HH:mm") e se já foi pago, como a agenda os entrega
 * @param date dia do agendamento ("aaaa-mm-dd", no fuso da empresa)
 * @param today dia de hoje, e `nowMinutes` o horário de agora em minutos
 */
export function canMarkNoShow(
  appointment: { status: AppointmentStatus; start: string; paid?: boolean },
  date: string,
  today: string,
  nowMinutes: number,
): boolean {
  if (!NO_SHOW_FROM.includes(appointment.status)) return false;
  // Pagamento já recebido: não há reembolso, então a falta não se marca.
  if (appointment.paid) return false;
  // Já iniciou (ou terminou) pelo status.
  if (
    appointment.status === "IN_PROGRESS" ||
    appointment.status === "COMPLETED"
  ) {
    return true;
  }
  if (date < today) return true;
  if (date > today) return false;
  return timeToMinutes(appointment.start) <= nowMinutes;
}
