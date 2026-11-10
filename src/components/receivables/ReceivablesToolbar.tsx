"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { changeDate } from "@/components/client-portfolio/portfolio-filters";
import {
  RECEIVABLES_PATH,
  receivablesQuery,
  type ReceivablesFiltersState,
} from "@/components/receivables/receivables-filters";
import { DatePicker } from "@/components/shared/DatePicker";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";

type ReceivablesToolbarProps = {
  filters: ReceivablesFiltersState;
  /** Mês atual no fuso da empresa (o período padrão). */
  month: { from: string; to: string };
};

/**
 * Filtros da Análise de recebíveis (na URL): o período (recebido e inadimplência)
 * e a busca da lista. No celular fica só a busca; o período é o mês atual.
 */
export function ReceivablesToolbar({
  filters,
  month,
}: ReceivablesToolbarProps) {
  const router = useRouter();

  // Troca um filtro e volta para a primeira página.
  function change(overrides: Partial<ReceivablesFiltersState>) {
    const query = receivablesQuery(filters, month, overrides).toString();
    router.push(query ? `${RECEIVABLES_PATH}?${query}` : RECEIVABLES_PATH);
  }

  const hasFilters =
    filters.from !== "" || filters.to !== "" || filters.search !== "";
  // A busca mantém o período na URL.
  const searchQuery = Object.fromEntries(
    receivablesQuery(filters, month, { search: "" }),
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`from-${filters.from}`}
          id="receivables-from"
          name="from"
          placeholder="Período de"
          initialValue={filters.from || month.from}
          onValueChange={(value) =>
            change(changeDate(filters, month, "from", value))
          }
        />
      </div>
      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`to-${filters.to}`}
          id="receivables-to"
          name="to"
          placeholder="Período até"
          // O fim pode cair adiante (ex.: o mês inteiro).
          maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
          initialValue={filters.to || month.to}
          onValueChange={(value) =>
            change(changeDate(filters, month, "to", value))
          }
        />
      </div>

      <div className="w-full sm:w-64">
        <ListSearch
          basePath={RECEIVABLES_PATH}
          search={filters.search}
          label="Buscar cliente por nome"
          placeholder="Buscar cliente…"
          query={searchQuery}
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          className="w-auto"
          onClick={() => router.push(RECEIVABLES_PATH)}
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
