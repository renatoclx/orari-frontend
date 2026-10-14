import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_ORDER,
} from "@/components/agenda/appointment-status";

/** Legenda dos ícones de status, no rodapé da página, alinhada à direita. */
export function AgendaLegend() {
  return (
    <ul
      aria-label="Legenda dos status"
      className="flex shrink-0 flex-wrap justify-end gap-x-4 gap-y-1 text-xs text-muted-foreground"
    >
      {APPOINTMENT_STATUS_ORDER.map((status) => {
        const { label, icon: Icon } = APPOINTMENT_STATUS[status];
        return (
          <li key={status} className="flex items-center gap-1.5">
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </li>
        );
      })}
    </ul>
  );
}
