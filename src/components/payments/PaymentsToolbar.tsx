"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import {
  ALL,
  DEFAULT_PAYMENT_FILTER,
  PAYMENT_FILTERS,
  paymentQuery,
  type PaymentFilterId,
  type PaymentFiltersState,
} from "@/components/payments/payment-filters";
import { useClientSearch } from "@/components/recurrences/useClientSearch";
import { Combobox } from "@/components/shared/Combobox";
import { DatePicker } from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_PATH = "/financeiro";

type PaymentsToolbarProps = {
  filters: PaymentFiltersState;
  /** Primeiros clientes e o filtrado (para o nome aparecer no campo). */
  clients: ClientOption[];
  /** Todos os métodos, inclusive os inativos: pagamentos antigos usam ambos. */
  methods: { id: string; name: string }[];
};

/**
 * Filtros da listagem (na URL): situação, vencimento, cliente e método. No
 * celular a barra some: ali só os cartões do resumo filtram.
 */
export function PaymentsToolbar({
  filters,
  clients,
  methods,
}: PaymentsToolbarProps) {
  const router = useRouter();
  const clientSearch = useClientSearch(
    clients,
    filters.client === ALL ? "" : filters.client,
  );
  // O vencimento filtra também o que ainda vai vencer: o calendário vai adiante.
  const maxDate = new Date(new Date().getFullYear() + 3, 11, 31);

  // Troca um filtro e volta para a primeira página.
  function change(overrides: Partial<PaymentFiltersState>) {
    const query = paymentQuery(filters, overrides).toString();
    router.push(query ? `${BASE_PATH}?${query}` : BASE_PATH);
  }

  const hasFilters =
    filters.status !== DEFAULT_PAYMENT_FILTER ||
    filters.from !== "" ||
    filters.to !== "" ||
    filters.client !== ALL ||
    filters.method !== ALL;

  // Sem os cartões no celular, só o filtro de situação fica à mostra; os demais,
  // no computador.
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.status}
        onValueChange={(next) => change({ status: next as PaymentFilterId })}
      >
        <SelectTrigger
          className="w-full sm:w-40"
          aria-label="Filtrar por situação"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_FILTERS.map((filter) => (
            <SelectItem key={filter.id} value={filter.id}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`from-${filters.from}`}
          id="filter-from"
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
          id="filter-to"
          name="to"
          placeholder="Vencimento até"
          maxDate={maxDate}
          initialValue={filters.to}
          onValueChange={(to) => change({ to })}
        />
      </div>

      <div className="w-60 max-sm:hidden">
        <Combobox
          id="filter-client"
          ariaLabel="Filtrar por cliente"
          options={[
            { value: ALL, label: "Todos os clientes" },
            ...clientSearch.options.map((client) => ({
              value: client.id,
              label: client.name,
            })),
          ]}
          value={filters.client}
          onValueChange={(next) => {
            clientSearch.pick(next);
            change({ client: next });
          }}
          placeholder="Todos os clientes"
          searchPlaceholder="Buscar cliente…"
          emptyMessage="Nenhum cliente encontrado."
          loading={clientSearch.loading}
          onSearchChange={clientSearch.search}
        />
      </div>

      <Select
        value={filters.method}
        onValueChange={(next) => change({ method: next })}
      >
        <SelectTrigger
          className="w-52 max-sm:hidden"
          aria-label="Filtrar por método de pagamento"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os métodos</SelectItem>
          {methods.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          className="w-auto"
          onClick={() => router.push(BASE_PATH)}
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
