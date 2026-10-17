import { Repeat } from "lucide-react";
import { OVERBOOKING_COLOR } from "@/components/agenda/agenda-data";
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_ORDER,
} from "@/components/agenda/appointment-status";

/** Legenda dos ícones de status, no rodapé da página, alinhada à direita. */
export function AgendaLegend() {
  return (
    <ul
      aria-label="Legenda dos status"
      // Celular: itens distribuídos por igual e centralizados em cada linha.
      // A partir do md: em linha, à direita.
      className="flex shrink-0 flex-wrap justify-evenly gap-x-3 gap-y-2 text-xs whitespace-nowrap text-muted-foreground md:justify-end md:gap-x-4 md:gap-y-1"
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
      <li className="flex items-center gap-1.5">
        <span
          className="size-3 rounded-sm"
          style={{ backgroundColor: OVERBOOKING_COLOR }}
          aria-hidden="true"
        />
        Encaixe
      </li>
      {/* Mesmo ícone do bloco: sessão de recorrência ou de pacote. */}
      <li className="flex items-center gap-1.5">
        <Repeat className="size-3.5" aria-hidden="true" />
        Recorrente
      </li>
    </ul>
  );
}
