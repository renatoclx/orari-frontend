"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { Button } from "@/components/ui/button";
import type { UserType } from "@/types/auth";

type UsersToolbarProps = {
  typeOptions: UserType[];
  currentUserId: string;
};

/** Botão de novo usuário, que abre o dialog de cadastro. */
export function UsersToolbar({
  typeOptions,
  currentUserId,
}: UsersToolbarProps) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
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
      />
    </div>
  );
}
