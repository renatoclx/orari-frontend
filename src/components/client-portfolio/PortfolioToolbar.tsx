"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  DEFAULT_STATUS_FILTER,
  PORTFOLIO_PATH,
  PORTFOLIO_STATUS_FILTERS,
  changeDate,
  portfolioQuery,
  type PortfolioFiltersState,
} from "@/components/client-portfolio/portfolio-filters";
import { DatePicker } from "@/components/shared/DatePicker";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PortfolioToolbarProps = {
  filters: PortfolioFiltersState;
  /** Mês atual no fuso da empresa (o período padrão). */
  month: { from: string; to: string };
  professionals: { id: string; name: string }[];
};

/**
 * Filtros da carteira (na URL): profissional, período, situação e busca. No
 * celular ficam só o profissional e a busca; a situação sai pelos cartões.
 */
export function PortfolioToolbar({
  filters,
  month,
  professionals,
}: PortfolioToolbarProps) {
  const router = useRouter();

  // Troca um filtro e volta para a primeira página.
  function change(overrides: Partial<PortfolioFiltersState>) {
    const query = portfolioQuery(filters, month, overrides).toString();
    router.push(query ? `${PORTFOLIO_PATH}?${query}` : PORTFOLIO_PATH);
  }

  const hasFilters =
    filters.from !== "" ||
    filters.to !== "" ||
    filters.status !== DEFAULT_STATUS_FILTER ||
    filters.search !== "";
  // Sem filtros, só o profissional continua escolhido.
  const cleared = portfolioQuery(
    { ...filters, from: "", to: "", status: DEFAULT_STATUS_FILTER, search: "" },
    month,
  ).toString();
  // A busca mantém os demais filtros na URL.
  const searchQuery = Object.fromEntries(
    portfolioQuery(filters, month, { search: "" }),
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.professional}
        onValueChange={(professional) => change({ professional })}
      >
        <SelectTrigger className="w-full sm:w-60" aria-label="Profissional">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {professionals.map((professional) => (
            <SelectItem key={professional.id} value={professional.id}>
              {professional.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`from-${filters.from}`}
          id="portfolio-from"
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
          id="portfolio-to"
          name="to"
          placeholder="Período até"
          // O fim pode cair adiante (ex.: o mês inteiro, com agendamentos futuros).
          maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
          initialValue={filters.to || month.to}
          onValueChange={(value) =>
            change(changeDate(filters, month, "to", value))
          }
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(status) => change({ status })}
      >
        <SelectTrigger
          className="w-48 max-sm:hidden"
          aria-label="Filtrar por situação"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PORTFOLIO_STATUS_FILTERS.map((filter) => (
            <SelectItem key={filter.id} value={filter.id}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-full sm:w-64">
        <ListSearch
          basePath={PORTFOLIO_PATH}
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
          onClick={() =>
            router.push(
              cleared ? `${PORTFOLIO_PATH}?${cleared}` : PORTFOLIO_PATH,
            )
          }
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
