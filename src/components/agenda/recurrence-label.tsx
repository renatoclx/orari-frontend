import { Package, Repeat } from "lucide-react";
import type { AgendaAppointment } from "@/types/agenda";

type Recurrence = NonNullable<AgendaAppointment["recurrence"]>;

/** Origem do agendamento que veio de uma recorrência (avulso não tem origem). */
export function recurrenceLabel(recurrence: Recurrence): string {
  return recurrence.clientPlanId ? "Sessão de pacote" : "Recorrente";
}

/** Nome curto da origem, para o bloco da agenda (que é estreito): "Pacote" ou "Recorrente". */
export function recurrenceShortLabel(recurrence: Recurrence): string {
  return recurrence.clientPlanId ? "Pacote" : "Recorrente";
}

/** Ícone da origem: pacote (o mesmo do menu "Pacotes") ou recorrência. */
export function RecurrenceOriginIcon({
  recurrence,
  className,
}: {
  recurrence: Recurrence;
  className?: string;
}) {
  return recurrence.clientPlanId ? (
    <Package className={className} aria-hidden="true" />
  ) : (
    <Repeat className={className} aria-hidden="true" />
  );
}
