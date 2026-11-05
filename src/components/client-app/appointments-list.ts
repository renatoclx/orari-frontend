import type { AppAppointment } from "@/types/client-app";

// Regras puras da aba Agendamentos do app (screens/app-cliente.md).

/** Situação de um atendimento passado; os próximos não mostram situação. */
export function pastStatusLabel(
  status: AppAppointment["status"],
): string | undefined {
  switch (status) {
    case "COMPLETED":
      return "Concluído";
    case "CANCELLED":
      return "Cancelado";
    case "NO_SHOW":
      return "Não compareceu";
    default:
      return undefined;
  }
}

/** Agendamento que não é avulso: só a clínica mexe nele. */
export function kindLabel(kind: AppAppointment["kind"]): string | undefined {
  switch (kind) {
    case "RECURRENCE":
      return "Horário fixo";
    case "PLAN":
      return "Pacote";
    case "CLASS":
      return "Turma";
    default:
      return undefined;
  }
}

/**
 * Por que um próximo agendamento não pode ser cancelado pelo app (para o
 * cliente saber o que fazer). Cancelável: `undefined`.
 */
export function cannotCancelReason(item: AppAppointment): string | undefined {
  if (item.canCancel) return undefined;
  if (item.kind !== "SINGLE")
    return "Para cancelar ou remarcar, fale com o estabelecimento.";
  return "Fora do prazo para cancelar pelo app. Fale com o estabelecimento.";
}

/** Só os de um estabelecimento (filtro); sem filtro, todos. */
export function filterByPlace(
  items: AppAppointment[],
  slug: string | undefined,
): AppAppointment[] {
  return slug ? items.filter((item) => item.place.slug === slug) : items;
}
