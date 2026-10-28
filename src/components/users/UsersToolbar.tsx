"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  UserFormDialog,
  type LinkOptions,
} from "@/components/users/UserFormDialog";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";
import type { UserType } from "@/types/auth";

type UsersToolbarProps = {
  /** Termo da busca na URL (?q=). */
  search: string;
  typeOptions: UserType[];
  currentUserId: string;
  linkOptions: LinkOptions;
};

/** Busca por nome e botão de novo usuário, que abre o dialog de cadastro. */
export function UsersToolbar({
  search,
  typeOptions,
  currentUserId,
  linkOptions,
}: UsersToolbarProps) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath="/usuarios"
        search={search}
        label="Buscar usuário por nome"
      />

      <Button
        className="w-full sm:ml-auto sm:w-auto"
        onClick={() => setCreating(true)}
      >
        <Plus aria-hidden="true" />
        Novo usuário
      </Button>

      <UserFormDialog
        open={creating}
        onOpenChange={setCreating}
        typeOptions={typeOptions}
        currentUserId={currentUserId}
        linkOptions={linkOptions}
      />
    </div>
  );
}
