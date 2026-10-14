"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { EllipsisVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClientAction } from "@/app/(admin)/clientes/actions";
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
import { Badge } from "@/components/ui/badge";
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

type ClientListProps = {
  clients: PersonListItem[];
  /** Termo da busca atual, para a mensagem de lista vazia. */
  search: string;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

// Quando não existe a informação, a tabela mostra "--" (screens.md).
const EMPTY = "--";

function Value({ children }: { children: React.ReactNode }) {
  return children ? (
    <>{children}</>
  ) : (
    <span className="text-muted-foreground">{EMPTY}</span>
  );
}

function formatContact(client: PersonListItem): string | null {
  const phone = client.principalContact?.phone;
  return phone ? formatPhone(phone) : null;
}

function StatusBadge({ client }: { client: PersonListItem }) {
  // O status vem do deletedAt; não é um campo da entidade.
  return client.deletedAt ? (
    <Badge variant="destructive">Inativo</Badge>
  ) : (
    <Badge variant="success">Ativo</Badge>
  );
}

export function ClientList({ clients, search, footer }: ClientListProps) {
  const [viewing, setViewing] = useState<PersonListItem | null>(null);
  const [deleting, setDeleting] = useState<PersonListItem | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;

    startTransition(async () => {
      const result = await deleteClientAction(target.id);
      if (result.ok) {
        toast.success("Cliente excluído.", { description: target.name });
        setDeleting(null);
      } else {
        toast.error("Não foi possível excluir o cliente.", {
          description: result.message,
        });
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {clients.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {search
              ? `Nenhum cliente encontrado para “${search}”.`
              : "Nenhum cliente cadastrado. Cadastre o primeiro!"}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {clients.map((client) => (
                <li key={client.id} className="flex items-start gap-3 p-4">
                  <PersonAvatar
                    name={client.name}
                    photoUrl={client.photoUrl}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate pt-2 font-medium">{client.name}</p>
                      <ClientActions
                        client={client}
                        onView={setViewing}
                        onDelete={setDeleting}
                      />
                    </div>
                    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm [&_dd]:whitespace-nowrap">
                      <dt className="text-muted-foreground">Celular</dt>
                      <dd className="tabular-nums">
                        <Value>{formatContact(client)}</Value>
                      </dd>
                      <dt className="text-muted-foreground">CPF</dt>
                      <dd className="tabular-nums">
                        <Value>
                          {client.document && formatCpf(client.document)}
                        </Value>
                      </dd>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <StatusBadge client={client} />
                      </dd>
                    </dl>
                  </div>
                </li>
              ))}
            </ul>

            <ClientTable
              clients={clients}
              onView={setViewing}
              onDelete={setDeleting}
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
          {viewing && <ClientDetails client={viewing} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && !pending && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              O cliente {deleting?.name} deixará de aparecer na lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => {
                // Mantém o diálogo aberto enquanto exclui ("Excluindo…").
                event.preventDefault();
                confirmDelete();
              }}
            >
              {pending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type RowHandlers = {
  onView: (client: PersonListItem) => void;
  onDelete: (client: PersonListItem) => void;
};

function ClientTable({
  clients,
  onView,
  onDelete,
}: { clients: PersonListItem[] } & RowHandlers) {
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
          <th scope="col" className={`${headerClass} text-right`}>
            Ações
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {clients.map((client) => (
          <tr key={client.id} className="hover:bg-background">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <PersonAvatar name={client.name} photoUrl={client.photoUrl} />
                <span className="font-medium">{client.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums">
              <Value>{formatContact(client)}</Value>
            </td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums">
              <Value>{client.document && formatCpf(client.document)}</Value>
            </td>
            <td className="hidden px-4 py-3 tabular-nums xl:table-cell">
              <Value>
                {client.birthDate && formatDateOnly(client.birthDate)}
              </Value>
            </td>
            <td className="hidden px-4 py-3 lg:table-cell">
              <Value>{client.profession}</Value>
            </td>
            <td className="px-4 py-3">
              <StatusBadge client={client} />
            </td>
            <td className="px-4 py-2">
              <ClientActions
                client={client}
                onView={onView}
                onDelete={onDelete}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Coluna Ações (screen-patterns.md): "Alterar" em destaque; as demais ações no
// menu de três pontos, em ordem fixa. Estilo neutro, só ícones.
function ClientActions({
  client,
  onView,
  onDelete,
}: { client: PersonListItem } & RowHandlers) {
  // Excluído: Alterar e Excluir ficam desabilitados (screens.md).
  const removed = client.deletedAt !== null;

  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
      {removed ? (
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-label={`Alterar ${client.name}`}
        >
          <Pencil aria-hidden="true" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" asChild>
          <Link
            href={`/clientes/${client.id}/editar`}
            aria-label={`Alterar ${client.name}`}
            title="Alterar"
          >
            <Pencil aria-hidden="true" />
          </Link>
        </Button>
      )}

      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Mais ações para ${client.name}`}
          >
            <EllipsisVertical aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(client)}>
            <Eye aria-hidden="true" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={removed}
            onSelect={() => onDelete(client)}
          >
            <Trash2 aria-hidden="true" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ClientDetails({ client }: { client: PersonListItem }) {
  const rows: [string, React.ReactNode][] = [
    ["Celular", formatContact(client)],
    ["E-mail", client.principalContact?.email],
    ["CPF", client.document && formatCpf(client.document)],
    [
      "Data de nascimento",
      client.birthDate && formatDateOnly(client.birthDate),
    ],
    ["Profissão", client.profession],
    ["Observações", client.note],
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <PersonAvatar name={client.name} photoUrl={client.photoUrl} />
          {client.name}
        </DialogTitle>
        <DialogDescription>Dados do cliente.</DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums">
              <Value>{value}</Value>
            </dd>
          </div>
        ))}
        <dt className="text-muted-foreground">Status</dt>
        <dd>
          <StatusBadge client={client} />
        </dd>
      </dl>
    </>
  );
}
