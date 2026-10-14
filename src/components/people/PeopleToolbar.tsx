"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { PeopleKind } from "@/components/people/people-kinds";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";

type PeopleToolbarProps = {
  kind: PeopleKind;
  /** Termo da busca na URL (?q=). */
  search: string;
};

export function PeopleToolbar({ kind, search }: PeopleToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath={kind.path}
        search={search}
        label={`Buscar ${kind.singular} por nome`}
      />

      <Button asChild className="w-full sm:ml-auto sm:w-auto">
        <Link href={`${kind.path}/novo`}>
          <Plus aria-hidden="true" />
          Novo {kind.singular}
        </Link>
      </Button>
    </div>
  );
}
