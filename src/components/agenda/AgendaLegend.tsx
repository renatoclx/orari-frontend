import { Package, Repeat } from "lucide-react";
import { OVERBOOKING_COLOR } from "@/components/agenda/agenda-data";
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_ORDER,
} from "@/components/agenda/appointment-status";

/**
 * Legenda dos ícones de status, no rodapé da página, alinhada à direita. Só do
 * tablet em diante: no celular ela truncava e ocupava a altura da grade.
 */
export function AgendaLegend() {
  return (
    <ul
      aria-label="Legenda dos status"
      className="hidden shrink-0 flex-wrap justify-end gap-x-4 gap-y-1 text-xs whitespace-nowrap text-muted-foreground md:flex"
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
      {/* Mesmos ícones do bloco: sessão de recorrência e sessão de pacote. */}
      <li className="flex items-center gap-1.5">
        <Repeat className="size-3.5" aria-hidden="true" />
        Recorrente
      </li>
      <li className="flex items-center gap-1.5">
        <Package className="size-3.5" aria-hidden="true" />
        Pacote
      </li>
    </ul>
  );
}
