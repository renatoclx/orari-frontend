"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(admin)/actions";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUser } from "@/types/auth";

type UserMenuProps = {
  user: CurrentUser;
};

export function UserMenu({ user }: UserMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    // A Server Action é chamada como uma função; o Next faz a requisição.
    startTransition(() => logout());
  }

  return (
    <>
      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          aria-label="Menu do usuário"
          className="rounded-full"
        >
          <PersonAvatar name={user.name} size="lg" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-1.5">
          <DropdownMenuLabel className="space-y-0.5 px-3 py-2.5 font-normal">
            <p className="truncate pb-1.5 text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.company.name}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="gap-2.5 px-3 py-2"
          >
            <LogOut aria-hidden="true" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do Orari?</AlertDialogTitle>
            <AlertDialogDescription>
              Você precisará entrar de novo para acessar os agendamentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              // Vermelho sólido: sair encerra a sessão.
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => {
                // Mantém o diálogo aberto enquanto sai, com o texto "Saindo…".
                event.preventDefault();
                handleLogout();
              }}
            >
              {pending ? "Saindo…" : "Sair"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
