"use client";

import { useState, useTransition } from "react";
import {
  Ban,
  EllipsisVertical,
  Eye,
  KeyRound,
  Pencil,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteUserAction,
  restoreUserAction,
} from "@/app/(admin)/user-actions";
import { PasswordDialog } from "@/components/users/PasswordDialog";
import {
  UserFormDialog,
  type LinkOptions,
} from "@/components/users/UserFormDialog";
import { FunctionBadge } from "@/components/users/FunctionBadge";
import { UserTypeBadge } from "@/components/users/UserTypeBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserType } from "@/types/auth";
import type { UserListItem } from "@/types/user";

type UserListProps = {
  users: UserListItem[];
  /** Termo da busca, só para a mensagem de lista vazia. */
  search: string;
  /** Tipos que quem está logado pode atribuir. */
  typeOptions: UserType[];
  /** Usuário logado: não pode inativar a si mesmo nem mudar o próprio tipo. */
  currentUserId: string;
  /** Pessoas ativas que o usuário pode representar, para o vínculo na alteração. */
  linkOptions: LinkOptions;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

type RowHandlers = {
  onView: (user: UserListItem) => void;
  onEdit: (user: UserListItem) => void;
  onPassword: (user: UserListItem) => void;
  onDeactivate: (user: UserListItem) => void;
  onRestore: (user: UserListItem) => void;
  /** Há uma reativação em andamento. */
  busy: boolean;
  currentUserId: string;
};

// Coluna Ações (screen-patterns.md): "Alterar" em destaque; as demais no menu
// de três pontos. O próprio usuário não aparece com "Inativar". Inativo só tem
// Visualizar e Reativar (a API não altera usuário inativo).
function UserActions({
  user,
  onView,
  onEdit,
  onPassword,
  onDeactivate,
  onRestore,
  busy,
  currentUserId,
}: { user: UserListItem } & RowHandlers) {
  const active = user.deletedAt === null;
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Hint label={active ? `Alterar ${user.name}` : "Usuário inativo"}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Alterar ${user.name}`}
          disabled={!active}
          onClick={() => onEdit(user)}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </Hint>

      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Hint label={`Mais ações para ${user.name}`}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Mais ações para ${user.name}`}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </Hint>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(user)}>
            <Eye aria-hidden="true" />
            Visualizar
          </DropdownMenuItem>
          {active && (
            <DropdownMenuItem onSelect={() => onPassword(user)}>
              <KeyRound aria-hidden="true" />
              Alterar senha
            </DropdownMenuItem>
          )}
          {active && user.id !== currentUserId && (
            <DropdownMenuItem onSelect={() => onDeactivate(user)}>
              <Ban aria-hidden="true" />
              Inativar
            </DropdownMenuItem>
          )}
          {!active && (
            <DropdownMenuItem disabled={busy} onSelect={() => onRestore(user)}>
              <RotateCcw aria-hidden="true" />
              Reativar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function UserList({
  users,
  search,
  typeOptions,
  currentUserId,
  linkOptions,
  footer,
}: UserListProps) {
  // O usuário fica guardado ao fechar, para o dialog não trocar de título
  // durante a animação de saída.
  const [editing, setEditing] = useState<UserListItem>();
  const [editOpen, setEditOpen] = useState(false);
  const [viewing, setViewing] = useState<UserListItem | null>(null);
  const [password, setPassword] = useState<UserListItem | null>(null);
  const [deactivating, setDeactivating] = useState<UserListItem | null>(null);
  const [pending, startTransition] = useTransition();
  const [restoring, startRestore] = useTransition();

  function restore(user: UserListItem) {
    startRestore(async () => {
      const result = await restoreUserAction(user.id);
      if (result.ok) {
        toast.success("Usuário reativado.", { description: user.name });
      } else {
        toast.error("Não foi possível reativar o usuário.", {
          description: result.message,
        });
      }
    });
  }

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;
    startTransition(async () => {
      const result = await deleteUserAction(target.id);
      if (result.ok) {
        toast.success("Usuário inativado.", { description: target.name });
        setDeactivating(null);
      } else {
        toast.error("Não foi possível inativar o usuário.", {
          description: result.message,
        });
      }
    });
  }

  const handlers: RowHandlers = {
    onView: setViewing,
    onEdit: (user) => {
      setEditing(user);
      setEditOpen(true);
    },
    onPassword: setPassword,
    onDeactivate: setDeactivating,
    onRestore: restore,
    busy: restoring,
    currentUserId,
  };
  return (
    <ListCard
      columns={[
        "Nome",
        "E-mail",
        "Tipo de usuário",
        "Função",
        "Status",
        "Ações",
      ]}
      emptyMessage={
        users.length === 0
          ? search
            ? `Nenhum usuário encontrado para “${search}”.`
            : "Nenhum usuário cadastrado. Cadastre o primeiro!"
          : undefined
      }
      cards={users.map((user) => (
        <li key={user.id} className="space-y-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{user.name}</p>
            <UserActions user={user} {...handlers} />
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
            <dt className="text-muted-foreground">E-mail</dt>
            <dd className="truncate">{user.email}</dd>
            <dt className="text-muted-foreground">Tipo</dt>
            <dd>
              <UserTypeBadge type={user.type} />
            </dd>
            <dt className="text-muted-foreground">Função</dt>
            <dd>
              <FunctionBadge person={user.people} />
            </dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge active={user.deletedAt === null} />
            </dd>
          </dl>
        </li>
      ))}
      rows={users.map((user) => (
        <tr key={user.id} className="hover:bg-background">
          <td className="px-4 py-3 font-medium">
            {user.name}
            {user.id === currentUserId && (
              <span className="ml-2 text-xs text-muted-foreground">(você)</span>
            )}
          </td>
          <td className="px-4 py-3">{user.email}</td>
          <td className="px-4 py-3">
            <UserTypeBadge type={user.type} />
          </td>
          <td className="px-4 py-3">
            <FunctionBadge person={user.people} />
          </td>
          <td className="px-4 py-3">
            <StatusBadge active={user.deletedAt === null} />
          </td>
          <td className="px-4 py-2">
            <UserActions user={user} {...handlers} />
          </td>
        </tr>
      ))}
      footer={footer}
    >
      <UserFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={editing}
        typeOptions={typeOptions}
        currentUserId={currentUserId}
        linkOptions={linkOptions}
      />

      <PasswordDialog
        user={password}
        onOpenChange={(open) => !open && setPassword(null)}
      />

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{viewing.name}</DialogTitle>
                <DialogDescription>Dados do usuário.</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">E-mail</dt>
                <dd>{viewing.email}</dd>
                <dt className="text-muted-foreground">Tipo de usuário</dt>
                <dd>
                  <UserTypeBadge type={viewing.type} />
                </dd>
                <dt className="text-muted-foreground">Função</dt>
                <dd>
                  <FunctionBadge person={viewing.people} />
                </dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge active={viewing.deletedAt === null} />
                </dd>
              </dl>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              <X aria-hidden="true" />
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Inativar usuário?"
        description={`${deactivating?.name ?? ""} perderá o acesso ao Orari. Você poderá reativá-lo depois.`}
        confirmLabel="Inativar"
        pendingLabel="Inativando…"
        icon={Ban}
        pending={pending}
        destructive
        onConfirm={confirmDeactivate}
      />
    </ListCard>
  );
}
