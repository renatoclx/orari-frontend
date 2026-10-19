"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import { useClientSearch } from "@/components/recurrences/useClientSearch";
import { Combobox } from "@/components/shared/Combobox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_PATH = "/pacotes/contratacoes";
// Valor das opções "Todos": o filtro sai da URL.
const ALL = "all";

type Filters = { client: string; plan: string; status: string };

type ClientPlansToolbarProps = {
  /** Filtros atuais; "all" = sem filtro. */
  filters: Filters;
  /** Primeiros clientes e o filtrado (para o nome aparecer no campo). */
  clients: ClientOption[];
  plans: { id: string; name: string }[];
};

/** Filtros por cliente, plano e status (na URL) e o botão de nova contratação. */
export function ClientPlansToolbar({
  filters,
  clients,
  plans,
}: ClientPlansToolbarProps) {
  const router = useRouter();
  const clientSearch = useClientSearch(
    clients,
    filters.client === ALL ? "" : filters.client,
  );

  // Troca um filtro e volta para a primeira página.
  function change(key: keyof Filters, value: string) {
    const params = new URLSearchParams();
    for (const [name, current] of Object.entries({
      ...filters,
      [key]: value,
    })) {
      if (current && current !== ALL) params.set(name, current);
    }
    const query = params.toString();
    router.push(query ? `${BASE_PATH}?${query}` : BASE_PATH);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-full sm:w-60">
        <Combobox
          id="filter-client"
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
            change("client", next);
          }}
          placeholder="Todos os clientes"
          searchPlaceholder="Buscar cliente…"
          emptyMessage="Nenhum cliente encontrado."
          loading={clientSearch.loading}
          onSearchChange={clientSearch.search}
        />
      </div>

      <Select
        value={filters.plan}
        onValueChange={(next) => change("plan", next)}
      >
        <SelectTrigger
          className="w-full sm:w-52"
          aria-label="Filtrar por plano"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os planos</SelectItem>
          {plans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              {plan.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(next) => change("status", next)}
      >
        <SelectTrigger
          className="w-full sm:w-44"
          aria-label="Filtrar por status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os status</SelectItem>
          <SelectItem value="active">Ativas</SelectItem>
          <SelectItem value="ended">Encerradas</SelectItem>
          <SelectItem value="cancelled">Canceladas</SelectItem>
        </SelectContent>
      </Select>

      <Button asChild className="w-full sm:ml-auto sm:w-auto">
        <Link href={`${BASE_PATH}/nova`}>
          <Plus aria-hidden="true" />
          Nova contratação
        </Link>
      </Button>
    </div>
  );
}
