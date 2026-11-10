"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { changeDate } from "@/components/client-portfolio/portfolio-filters";
import {
  DEFAULT_RANKING_SORT,
  RANKING_SORTS,
  RANKINGS_PATH,
  rankingsQuery,
  type RankingsFilters,
} from "@/components/rankings/rankings-filters";
import { DatePicker } from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Filtros dos Rankings (na URL): período e ordem. No celular fica só a ordem;
 * o período é o mês atual.
 */
export function RankingsToolbar({
  filters,
  month,
}: {
  filters: RankingsFilters;
  month: { from: string; to: string };
}) {
  const router = useRouter();

  function change(overrides: Partial<RankingsFilters>) {
    const query = rankingsQuery(filters, month, overrides).toString();
    router.push(query ? `${RANKINGS_PATH}?${query}` : RANKINGS_PATH);
  }

  const hasFilters =
    filters.from !== "" ||
    filters.to !== "" ||
    filters.sort !== DEFAULT_RANKING_SORT;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`from-${filters.from}`}
          id="rankings-from"
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
          id="rankings-to"
          name="to"
          placeholder="Período até"
          maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
          initialValue={filters.to || month.to}
          onValueChange={(value) =>
            change(changeDate(filters, month, "to", value))
          }
        />
      </div>

      <Select value={filters.sort} onValueChange={(sort) => change({ sort })}>
        <SelectTrigger className="w-full sm:w-60" aria-label="Ordem">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANKING_SORTS.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          className="w-auto"
          onClick={() => router.push(RANKINGS_PATH)}
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
