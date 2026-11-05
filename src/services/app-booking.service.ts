import "server-only";

import { appFetch } from "@/services/app-api";
import type { Slot } from "@/components/client-app/booking-slots";

// Agendar pelo app do cliente (backend: /portal/:slug/availability e
// /portal/:slug/appointments; screens/app-cliente.md).

/** Horários livres de um dia, calculados no servidor com as regras da clínica. */
export function getAvailability(
  slug: string,
  query: { serviceId: string; professionalId: string; date: string },
): Promise<Slot[]> {
  const params = new URLSearchParams(query).toString();
  return appFetch<Slot[]>(
    `/portal/${encodeURIComponent(slug)}/availability?${params}`,
    { authenticated: false },
  );
}

/** Agenda um avulso num dos horários livres (origem PORTAL). */
export function bookAppointment(
  slug: string,
  data: { serviceId: string; professionalId: string; startAt: string },
): Promise<{ id: string }> {
  return appFetch(`/portal/${encodeURIComponent(slug)}/appointments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
