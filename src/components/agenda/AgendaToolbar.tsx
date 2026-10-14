import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type AgendaToolbarProps = {
  dateLabel: string;
};

/** Navegação entre dias da agenda (ainda sem ação, até a agenda ter estado real). */
export function AgendaToolbar({ dateLabel }: AgendaToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" aria-label="Dia anterior">
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Próximo dia">
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button variant="outline">Hoje</Button>
      </div>

      {/* No celular, a data ocupa a primeira linha e os botões descem. */}
      <h2 className="text-lg font-semibold max-sm:order-first max-sm:w-full">
        {dateLabel}
      </h2>

      <Button className="ml-auto">
        <Plus aria-hidden="true" />
        Agendar
      </Button>
    </div>
  );
}
