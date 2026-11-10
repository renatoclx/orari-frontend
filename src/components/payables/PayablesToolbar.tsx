"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  ALL,
  PAYABLE_FILTERS,
  PAYABLES_PATH,
  payableQuery,
  type PayableFilterId,
  type PayableFiltersState,
} from "@/components/payables/payable-filters";
import { DatePicker } from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: string; name: string };

/**
 * Filtros da lista (na URL): situação, vencimento, favorecido e categoria. No
 * celular fica só a situação (os cartões somem também).
 */
export function PayablesToolbar({
  filters,
  payees,
  categories,
}: {
  filters: PayableFiltersState;
  /** Fornecedores e profissionais. */
  payees: Option[];
  /** Todas as categorias, inclusive as inativas (contas antigas usam). */
  categories: Option[];
}) {
  const router = useRouter();
  // O vencimento filtra também o que ainda vai vencer.
  const maxDate = new Date(new Date().getFullYear() + 5, 11, 31);

  function change(overrides: Partial<PayableFiltersState>) {
    const query = payableQuery(filters, overrides).toString();
    router.push(query ? `${PAYABLES_PATH}?${query}` : PAYABLES_PATH);
  }

  const hasFilters = payableQuery(filters).size > 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.status}
        onValueChange={(next) => change({ status: next as PayableFilterId })}
      >
        <SelectTrigger
          className="w-full sm:w-40"
          aria-label="Filtrar por situação"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAYABLE_FILTERS.map((filter) => (
            <SelectItem key={filter.id} value={filter.id}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`from-${filters.from}`}
          id="payables-from"
          name="from"
          placeholder="Vencimento de"
          maxDate={maxDate}
          initialValue={filters.from}
          onValueChange={(from) => change({ from })}
        />
      </div>
      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`to-${filters.to}`}
          id="payables-to"
          name="to"
          placeholder="Vencimento até"
          maxDate={maxDate}
          initialValue={filters.to}
          onValueChange={(to) => change({ to })}
        />
      </div>

      <Select
        value={filters.payee}
        onValueChange={(payee) => change({ payee })}
      >
        <SelectTrigger
          className="w-56 max-sm:hidden"
          aria-label="Filtrar por favorecido"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os favorecidos</SelectItem>
          {payees.map((payee) => (
            <SelectItem key={payee.id} value={payee.id}>
              {payee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(category) => change({ category })}
      >
        <SelectTrigger
          className="w-52 max-sm:hidden"
          aria-label="Filtrar por categoria"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          className="w-auto"
          onClick={() => router.push(PAYABLES_PATH)}
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
