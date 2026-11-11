import type { AppAppointment, AppPlace } from "@/types/client-app";

// Regras do Início do app (screens/app-cliente.md), puras e testadas.

/** O card do Início: o próximo agendamento ou, sem nenhum marcado, o último. */
export type FeaturedAppointment = {
  kind: "next" | "last";
  appointment: AppAppointment;
};

const time = (appointment: AppAppointment) =>
  new Date(appointment.startAt).getTime();

/**
 * Próximo agendamento (o mais cedo dos marcados); sem nenhum, o último que
 * aconteceu, sem contar os cancelados. Sem agendamentos, `null`.
 */
export function featuredAppointment(
  upcoming: AppAppointment[],
  past: AppAppointment[],
): FeaturedAppointment | null {
  const next = [...upcoming].sort((a, b) => time(a) - time(b))[0];
  if (next) return { kind: "next", appointment: next };
  const last = past
    .filter((appointment) => appointment.status !== "CANCELLED")
    .sort((a, b) => time(b) - time(a))[0];
  return last ? { kind: "last", appointment: last } : null;
}

/**
 * "Últimos acessos": os locais da conta, do agendamento mais recente (marcado
 * ou passado) para o mais antigo; os sem agendamento vão para o fim, na ordem
 * em que a API os devolveu.
 */
export function recentPlaces(
  places: AppPlace[],
  appointments: AppAppointment[],
): AppPlace[] {
  const latest = new Map<string, number>();
  for (const appointment of appointments) {
    const slug = appointment.place.slug;
    latest.set(slug, Math.max(latest.get(slug) ?? 0, time(appointment)));
  }
  return places
    .map((place, index) => ({ place, index, at: latest.get(place.slug) ?? 0 }))
    .sort((a, b) => b.at - a.at || a.index - b.index)
    .map(({ place }) => place);
}
