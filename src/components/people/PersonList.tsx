"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { EllipsisVertical, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deletePersonAction,
  reactivatePersonAction,
} from "@/app/(admin)/people-actions";
import type { PeopleKind } from "@/components/people/people-kinds";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
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
import type { PersonListItem } from "@/types/people";
import { formatCpf, formatDateOnly, formatPhone } from "@/utils/format";

type PersonListProps = {
  kind: PeopleKind;
  people: PersonListItem[];
  /** Termo da busca atual, para a mensagem de lista vazia. */
  search: string;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

// Celular do contato principal, formatado.
function formatContact(person: PersonListItem): string | null {
  const phone = person.principalContact?.phone;
  return phone ? formatPhone(phone) : null;
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular), com as ações de cada pessoa. */
export function PersonList({ kind, people, search, footer }: PersonListProps) {
  const [viewing, setViewing] = useState<PersonListItem | null>(null);
  const [deleting, setDeleting] = useState<PersonListItem | null>(null);
  const [pending, startTransition] = useTransition();
  const [reactivating, startReactivate] = useTransition();

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;

    startTransition(async () => {
      const result = await deletePersonAction(target.id, kind.type);
      if (result.ok) {
        toast.success(`${kind.singularTitle} inativado.`, {
          description: target.name,
        });
        setDeleting(null);
      } else {
        toast.error(`Não foi possível inativar o ${kind.singular}.`, {
          description: result.message,
        });
      }
    });
  }

  function reactivate(person: PersonListItem) {
    startReactivate(async () => {
      const result = await reactivatePersonAction(person.id, kind.type);
      if (result.ok) {
        toast.success(`${kind.singularTitle} reativado.`, {
          description: person.name,
        });
      } else {
        toast.error(`Não foi possível reativar o ${kind.singular}.`, {
          description: result.message,
        });
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {people.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {search
              ? `Nenhum ${kind.singular} encontrado para “${search}”.`
              : `Nenhum ${kind.singular} cadastrado. Cadastre o primeiro!`}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {people.map((person) => (
                <li key={person.id} className="flex items-start gap-3 p-4">
                  <PersonAvatar
                    name={person.name}
                    photoUrl={person.photoUrl}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate pt-2 font-medium">{person.name}</p>
                      <PersonActions
                        person={person}
                        onView={setViewing}
                        onDelete={setDeleting}
                        onReactivate={reactivate}
                        busy={reactivating}
                        basePath={kind.path}
                      />
                    </div>
                    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm [&_dd]:whitespace-nowrap">
                      <dt className="text-muted-foreground">Celular</dt>
                      <dd className="tabular-nums">
                        <EmptyValue>{formatContact(person)}</EmptyValue>
                      </dd>
                      <dt className="text-muted-foreground">CPF</dt>
                      <dd className="tabular-nums">
                        <EmptyValue>
                          {person.document && formatCpf(person.document)}
                        </EmptyValue>
                      </dd>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <StatusBadge active={person.deletedAt === null} />
                      </dd>
                    </dl>
                  </div>
                </li>
              ))}
            </ul>

            <PersonTable
              people={people}
              onView={setViewing}
              onDelete={setDeleting}
              onReactivate={reactivate}
              busy={reactivating}
              basePath={kind.path}
            />
          </>
        )}
      </div>

      {footer}

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent>
          {viewing && <PersonDetails person={viewing} kind={kind} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Excluir ${kind.singular}?`}
        description={`O ${kind.singular} ${deleting?.name ?? ""} será inativado e continuará na lista com o status Inativo.`}
        confirmLabel="Excluir"
        pendingLabel="Excluindo…"
        pending={pending}
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

type RowHandlers = {
  onView: (person: PersonListItem) => void;
  onDelete: (person: PersonListItem) => void;
  onReactivate: (person: PersonListItem) => void;
  /** Caminho da listagem (base do link de alteração). */
  basePath: string;
  /** Há uma reativação em andamento. */
  busy: boolean;
};

function PersonTable({
  people,
  ...handlers
}: { people: PersonListItem[] } & RowHandlers) {
  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  return (
    <table className="hidden w-full text-left text-sm md:table">
      <thead>
        <tr>
          <th scope="col" className={headerClass}>
            Nome
          </th>
          <th scope="col" className={headerClass}>
            Celular
          </th>
          <th scope="col" className={headerClass}>
            CPF
          </th>
          <th scope="col" className={`${headerClass} hidden xl:table-cell`}>
            Data de nascimento
          </th>
          <th scope="col" className={`${headerClass} hidden lg:table-cell`}>
            Profissão
          </th>
          <th scope="col" className={headerClass}>
            Status
          </th>
          <th scope="col" className={`${headerClass}`}>
            Ações
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {people.map((person) => (
          <tr key={person.id} className="hover:bg-background">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <PersonAvatar name={person.name} photoUrl={person.photoUrl} />
                <span className="font-medium">{person.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums">
              <EmptyValue>{formatContact(person)}</EmptyValue>
            </td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums">
              <EmptyValue>
                {person.document && formatCpf(person.document)}
              </EmptyValue>
            </td>
            <td className="hidden px-4 py-3 tabular-nums xl:table-cell">
              <EmptyValue>
                {person.birthDate && formatDateOnly(person.birthDate)}
              </EmptyValue>
            </td>
            <td className="hidden px-4 py-3 lg:table-cell">
              <EmptyValue>{person.profession}</EmptyValue>
            </td>
            <td className="px-4 py-3">
              <StatusBadge active={person.deletedAt === null} />
            </td>
            <td className="px-4 py-2">
              <PersonActions person={person} {...handlers} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Coluna Ações (screen-patterns.md): "Alterar" em destaque; as demais ações no
// menu de três pontos, em ordem fixa. Estilo neutro, só ícones.
function PersonActions({
  person,
  onView,
  onDelete,
  onReactivate,
  busy,
  basePath,
}: { person: PersonListItem } & RowHandlers) {
  // Excluído: Alterar e Excluir ficam desabilitados (screens/pessoas.md).
  const removed = person.deletedAt !== null;

  return (
    <div className="flex shrink-0 items-center justify-start gap-1">
      {removed ? (
        // Desabilitado não recebe o mouse: a dica fica no invólucro.
        <Hint label={`Registro inativo: ${person.name} não pode ser alterado`}>
          <span className="inline-flex" tabIndex={0}>
            <Button
              variant="ghost"
              size="icon"
              disabled
              aria-label={`Alterar ${person.name}`}
            >
              <Pencil aria-hidden="true" />
            </Button>
          </span>
        </Hint>
      ) : (
        <Hint label={`Alterar ${person.name}`}>
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`${basePath}/${person.id}/editar`}
              aria-label={`Alterar ${person.name}`}
            >
              <Pencil aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
      )}

      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Hint label={`Mais ações para ${person.name}`}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Mais ações para ${person.name}`}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </Hint>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(person)}>
            <Eye aria-hidden="true" />
            Visualizar
          </DropdownMenuItem>
          {removed && (
            <DropdownMenuItem
              disabled={busy}
              onSelect={() => onReactivate(person)}
            >
              <RotateCcw aria-hidden="true" />
              Reativar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={removed}
            onSelect={() => onDelete(person)}
          >
            <Trash2 aria-hidden="true" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Conteúdo do dialog de visualização.
function PersonDetails({
  person,
  kind,
}: {
  person: PersonListItem;
  kind: PeopleKind;
}) {
  const rows: [string, React.ReactNode][] = [
    ["Celular", formatContact(person)],
    ["E-mail", person.principalContact?.email],
    ["CPF", person.document && formatCpf(person.document)],
    [
      "Data de nascimento",
      person.birthDate && formatDateOnly(person.birthDate),
    ],
    ["Profissão", person.profession],
    ["Observações", person.note],
  ];

  return (
    <>
      <DialogHeader>
        <div className="flex flex-1 justify-center">
          <PersonAvatar
            name={person.name}
            photoUrl={person.photoUrl}
            className="size-20 **:data-[slot=avatar-fallback]:text-3xl"
          />
        </div>
        <DialogTitle className="flex items-center gap-3">
          {person.name}
        </DialogTitle>
        <DialogDescription>Dados do {kind.singular}.</DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums">
              <EmptyValue>{value}</EmptyValue>
            </dd>
          </div>
        ))}
        <dt className="text-muted-foreground">Status</dt>
        <dd>
          <StatusBadge active={person.deletedAt === null} />
        </dd>
      </dl>
    </>
  );
}
