import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

const secondaryButtonClass =
  "rounded-control border border-border bg-surface text-sm hover:bg-background focus-visible:outline-2 focus-visible:outline-brand";

type AgendaToolbarProps = {
  dateLabel: string;
};

export function AgendaToolbar({ dateLabel }: AgendaToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Dia anterior"
          className={`${secondaryButtonClass} p-2`}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Próximo dia"
          className={`${secondaryButtonClass} p-2`}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className={`${secondaryButtonClass} px-3 py-1.5`}>
          Hoje
        </button>
      </div>

      <h2 className="text-lg font-semibold">{dateLabel}</h2>

      <Button variant="primary" className="ml-auto">
        <Plus className="size-4" aria-hidden="true" />
        Agendar
      </Button>
    </div>
  );
}
