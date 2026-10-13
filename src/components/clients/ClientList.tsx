import { Pencil, Trash2 } from "lucide-react";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import type { Client } from "@/types/client";
import { formatCpf, formatDateOnly, formatPhone } from "@/utils/format";

const iconButtonClass =
  "rounded-control p-2 text-muted-foreground hover:bg-background";

type ClientListProps = {
  clients: Client[];
};

export function ClientList({ clients }: ClientListProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-card border border-border bg-card">
      {clients.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Celular: lista empilhada. A partir do md, tabela. */}
          <ul className="divide-y divide-border md:hidden">
            {clients.map((client) => (
              <ClientItem key={client.id} client={client} />
            ))}
          </ul>
          <ClientTable clients={clients} />
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
      Não há clientes cadastrados. Cadastre o primeiro cliente!
    </p>
  );
}

function ClientItem({ client }: { client: Client }) {
  return (
    <li className="flex items-start gap-3 p-4">
      <PersonAvatar name={client.name} photoUrl={client.photoUrl} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate pt-2 font-medium">{client.name}</p>
          <ClientActions clientName={client.name} />
        </div>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm [&_dd]:whitespace-nowrap">
          <dt className="text-muted-foreground">Telefone</dt>
          <dd className="tabular-nums">
            <PhoneValue phone={client.mainPhone} />
          </dd>
          <dt className="text-muted-foreground">CPF</dt>
          <dd className="tabular-nums">{formatCpf(client.document)}</dd>
          <dt className="text-muted-foreground">Nascimento</dt>
          <dd className="tabular-nums">{formatDateOnly(client.birthDate)}</dd>
        </dl>
      </div>
    </li>
  );
}

function ClientTable({ clients }: ClientListProps) {
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
            Telefone
          </th>
          <th scope="col" className={headerClass}>
            CPF
          </th>
          <th scope="col" className={headerClass}>
            Nascimento
          </th>
          <th scope="col" className={`${headerClass} hidden lg:table-cell`}>
            Profissão
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
              <PhoneValue phone={client.mainPhone} />
            </td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums">
              {formatCpf(client.document)}
            </td>
            <td className="px-4 py-3 tabular-nums">
              {formatDateOnly(client.birthDate)}
            </td>
            <td className="hidden px-4 py-3 lg:table-cell">
              {client.profession ?? (
                <span className="text-muted-foreground">—</span>
              )}
            </td>
            <td className="px-4 py-2">
              <ClientActions clientName={client.name} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PhoneValue({ phone }: { phone: string | null }) {
  return phone ? (
    formatPhone(phone)
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

// Ações ainda sem tela de destino; existem para validar o layout.
function ClientActions({ clientName }: { clientName: string }) {
  return (
    <div className="flex shrink-0 justify-end gap-1">
      <button
        type="button"
        aria-label={`Editar ${clientName}`}
        title="Editar"
        className={`${iconButtonClass} hover:text-foreground`}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Excluir ${clientName}`}
        title="Excluir"
        className={`${iconButtonClass} hover:text-destructive`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
