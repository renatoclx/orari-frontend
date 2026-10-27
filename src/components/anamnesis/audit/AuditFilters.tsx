"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import {
  auditActionLabels,
  auditActions,
  auditQuery,
  type AuditFilters as Filters,
} from "@/components/anamnesis/audit/audit-filters";
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
import type { AuditAction } from "@/types/audit";

const BASE_PATH = "/anamnese/auditoria";
// O Radix Select não aceita valor vazio: "ALL" é "sem filtro".
const ALL = "ALL";

type AuditFiltersProps = {
  filters: Omit<Filters, "page">;
  /** Usuários da empresa, para o filtro (e os nomes da tabela). */
  users: { id: string; name: string }[];
  /** Primeiros clientes ativos; a busca no servidor cobre os demais. */
  initialClients: ClientOption[];
  /** Cliente do filtro (pode estar fora dos primeiros ou inativo). */
  pickedClient?: ClientOption;
};

/**
 * Filtros da auditoria. Cada escolha vai para a URL (só ids, ação e datas) e
 * volta à primeira página; a tela é renderizada de novo no servidor.
 */
export function AuditFilters({
  filters,
  users,
  initialClients,
  pickedClient,
}: AuditFiltersProps) {
  const router = useRouter();
  const clients = useClientSearch(initialClients, filters.clientId ?? "");
  const hasFilters = Object.keys(auditQuery(filters)).length > 0;

  function apply(next: Partial<Omit<Filters, "page">>) {
    const query = new URLSearchParams(auditQuery({ ...filters, ...next }));
    const text = query.toString();
    router.push(text ? `${BASE_PATH}?${text}` : BASE_PATH);
  }

  // Um valor novo no DatePicker troca o `key`: ele recomeça do valor da URL.
  const dateKey = `${filters.from ?? ""}|${filters.to ?? ""}`;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1.2fr_1fr_1fr_auto]">
      <Combobox
        id="audit-client"
        ariaLabel="Filtrar por cliente"
        options={[
          ...(pickedClient &&
          !clients.options.some((item) => item.id === pickedClient.id)
            ? [pickedClient]
            : []),
          ...clients.options,
        ].map((item) => ({ value: item.id, label: item.name }))}
        value={filters.clientId ?? ""}
        onValueChange={(next) => {
          clients.pick(next);
          apply({ clientId: next });
        }}
        placeholder="Cliente"
        searchPlaceholder="Buscar cliente…"
        emptyMessage="Nenhum cliente encontrado."
        loading={clients.loading}
        onSearchChange={clients.search}
      />

      <Select
        value={filters.userId ?? ALL}
        onValueChange={(next) =>
          apply({ userId: next === ALL ? undefined : next })
        }
      >
        <SelectTrigger className="w-full" aria-label="Filtrar por usuário">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os usuários</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.action ?? ALL}
        onValueChange={(next) =>
          apply({ action: next === ALL ? undefined : (next as AuditAction) })
        }
      >
        <SelectTrigger className="w-full" aria-label="Filtrar por ação">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as ações</SelectItem>
          {auditActions.map((action) => (
            <SelectItem key={action} value={action}>
              {auditActionLabels[action]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DatePicker
        key={`from-${dateKey}`}
        id="audit-from"
        name="from"
        placeholder="Data inicial"
        initialValue={filters.from}
        onValueChange={(next) => apply({ from: next || undefined })}
      />
      <DatePicker
        key={`to-${dateKey}`}
        id="audit-to"
        name="to"
        placeholder="Data final"
        initialValue={filters.to}
        onValueChange={(next) => apply({ to: next || undefined })}
      />

      {hasFilters && (
        <Button variant="ghost" onClick={() => router.push(BASE_PATH)}>
          <X aria-hidden="true" />
          Limpar
        </Button>
      )}
    </div>
  );
}
