"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_PATH = "/turmas";

type ClassGroupsToolbarProps = {
  /** Termo da busca na URL (?q=). */
  search: string;
  /** Filtro de status na URL (?status=); "all" = sem filtro. */
  status: string;
};

/** Busca por nome, filtro de status e botão de nova turma. */
export function ClassGroupsToolbar({
  search,
  status,
}: ClassGroupsToolbarProps) {
  const router = useRouter();

  // Troca o status mantendo a busca, e volta para a primeira página.
  function changeStatus(next: string) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (next !== "all") params.set("status", next);
    const query = params.toString();
    router.push(query ? `${BASE_PATH}?${query}` : BASE_PATH);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath={BASE_PATH}
        search={search}
        label="Buscar turma por nome"
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
          <SelectItem value="active">Ativas</SelectItem>
          <SelectItem value="inactive">Inativas</SelectItem>
        </SelectContent>
      </Select>

      <Button asChild className="w-full sm:ml-auto sm:w-auto">
        <Link href={`${BASE_PATH}/nova`}>
          <Plus aria-hidden="true" />
          Nova turma
        </Link>
      </Button>
    </div>
  );
}
