import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shiftDateString } from "@/utils/time";

type AgendaToolbarProps = {
  /** Dia exibido, "aaaa-mm-dd". */
  date: string;
  dateLabel: string;
};

// O dia fica na URL (?date=): os botões são links, então a navegação funciona
// sem estado no navegador e o dia pode ser compartilhado ou recarregado.
const dayHref = (date: string) => `/?date=${date}`;

/** Navegação entre dias da agenda e o botão de novo agendamento. */
export function AgendaToolbar({ date, dateLabel }: AgendaToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" asChild>
          <Link
            href={dayHref(shiftDateString(date, -1))}
            aria-label="Dia anterior"
          >
            <ChevronLeft aria-hidden="true" />
          </Link>
        </Button>
        <Button variant="outline" size="icon" asChild>
          <Link
            href={dayHref(shiftDateString(date, 1))}
            aria-label="Próximo dia"
          >
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Hoje</Link>
        </Button>
      </div>

      {/* No celular, a data ocupa a primeira linha e os botões descem. */}
      <h2 className="text-lg font-semibold max-sm:order-first max-sm:w-full">
        {dateLabel}
      </h2>

      <Button className="ml-auto">
        <Plus aria-hidden="true" />
        Novo Agendamento
      </Button>
    </div>
  );
}
