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
 * "Últimos acessos", na ordem em que o cliente vai usar os locais: primeiro os
 * com agendamento marcado (o mais próximo antes); depois os demais, do último
 * atendimento para o mais antigo; por fim os sem agendamento, na ordem em que
 * a API os devolveu. Cancelados não contam.
 */
export function recentPlaces(
  places: AppPlace[],
  upcoming: AppAppointment[],
  past: AppAppointment[],
): AppPlace[] {
  const active = (list: AppAppointment[]) =>
    list.filter((appointment) => appointment.status !== "CANCELLED");
  const soonest = new Map<string, number>();
  for (const appointment of active(upcoming)) {
    const slug = appointment.place.slug;
    soonest.set(
      slug,
      Math.min(soonest.get(slug) ?? Infinity, time(appointment)),
    );
  }
  const latest = new Map<string, number>();
  for (const appointment of active(past)) {
    const slug = appointment.place.slug;
    latest.set(slug, Math.max(latest.get(slug) ?? 0, time(appointment)));
  }
  // Grupo 0: marcado (mais próximo antes); 1: passado (mais recente antes);
  // 2: sem agendamento (ordem da API).
  const rank = (slug: string, index: number): [number, number] =>
    soonest.has(slug)
      ? [0, soonest.get(slug)!]
      : latest.has(slug)
        ? [1, -latest.get(slug)!]
        : [2, index];
  return places
    .map((place, index) => ({ place, key: rank(place.slug, index) }))
    .sort((a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1])
    .map(({ place }) => place);
}
