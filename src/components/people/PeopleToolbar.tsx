"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { PeopleKind } from "@/components/people/people-kinds";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PeopleToolbarProps = {
  kind: PeopleKind;
  /** Termo da busca na URL (?q=). */
  search: string;
  /** Filtro de status na URL (?status=); "all" = sem filtro. */
  status: string;
};

/** Busca por nome, filtro de status e botão de novo cadastro do tipo de pessoa. */
export function PeopleToolbar({ kind, search, status }: PeopleToolbarProps) {
  const router = useRouter();

  // Troca o status mantendo a busca, e volta para a primeira página.
  function changeStatus(next: string) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (next !== "all") params.set("status", next);
    const query = params.toString();
    router.push(query ? `${kind.path}?${query}` : kind.path);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath={kind.path}
        search={search}
        label={`Buscar ${kind.singular} por nome`}
        query={{ status: status === "all" ? undefined : status }}
      />

      <Select value={status} onValueChange={changeStatus}>
        <SelectTrigger
          className="w-full sm:w-44"
          aria-label="Filtrar por status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>

      <Button asChild className="w-full sm:ml-auto sm:w-auto">
        <Link href={`${kind.path}/novo`}>
          <Plus aria-hidden="true" />
          Novo {kind.singular}
        </Link>
      </Button>
    </div>
  );
}
