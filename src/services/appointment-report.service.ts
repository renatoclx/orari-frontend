import "server-only";

import { apiFetch } from "@/services/api";
import type { AppointmentReport } from "@/types/appointment-report";

/** Relatório de agendamentos; sem período, o mês atual; sem profissional, todos. */
export function getAppointmentReport(params: {
  professionalId?: string;
  from?: string;
  to?: string;
}): Promise<AppointmentReport> {
  const query = new URLSearchParams();
  if (params.professionalId) query.set("professionalId", params.professionalId);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  return apiFetch<AppointmentReport>(`/appointment-report?${query}`);
}
