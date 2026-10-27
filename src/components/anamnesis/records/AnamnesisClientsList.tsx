"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { ClientAnamnesesDialog } from "@/components/anamnesis/records/ClientAnamnesesDialog";
import { Hint } from "@/components/shared/Hint";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { AnamnesisClientItem } from "@/types/anamnesis";

type AnamnesisClientsListProps = {
  clients: AnamnesisClientItem[];
  /** Há busca aplicada, para a mensagem de lista vazia. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

/** Clientes com ficha: nome, quantidade e o botão que abre as fichas dele. */
export function AnamnesisClientsList({
  clients,
  filtered,
  footer,
}: AnamnesisClientsListProps) {
  const [viewing, setViewing] = useState<AnamnesisClientItem | null>(null);
  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  const viewButton = (client: AnamnesisClientItem) => (
    <Hint label={`Ver fichas de ${client.clientName}`}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Ver fichas de ${client.clientName}`}
        onClick={() => setViewing(client)}
      >
        <Eye aria-hidden="true" />
      </Button>
    </Hint>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {clients.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {filtered
              ? "Nenhum cliente com ficha encontrado para a busca."
              : "Nenhuma ficha cadastrada ainda. Use “Nova ficha” para começar."}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {clients.map((client) => (
                <li
                  key={client.clientId}
                  className="flex items-center justify-between gap-2 p-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">{client.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.anamnesisCount}{" "}
                      {client.anamnesisCount === 1 ? "ficha" : "fichas"}
                    </p>
                    <StatusBadge active={client.isActive} />
                  </div>
                  {viewButton(client)}
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  {["Cliente", "Fichas", "Status", "Ações"].map((title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.clientId} className="hover:bg-background">
                    <td className="px-4 py-3">
                      <span className="font-medium">{client.clientName}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {client.anamnesisCount}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={client.isActive} />
                    </td>
                    <td className="px-4 py-2">{viewButton(client)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <ClientAnamnesesDialog
        client={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      />
    </div>
  );
}
