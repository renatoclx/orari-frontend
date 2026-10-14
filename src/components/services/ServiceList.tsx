"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { ServiceFormDialog } from "@/components/services/ServiceFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceItem } from "@/types/service";
import { formatDuration, formatPrice } from "@/utils/format";

type ServiceListProps = {
  services: ServiceItem[];
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

function StatusBadge({ service }: { service: ServiceItem }) {
  return service.isActive ? (
    <Badge variant="success">Ativo</Badge>
  ) : (
    <Badge variant="destructive">Inativo</Badge>
  );
}

// Coluna Ações (screen-patterns.md): "Alterar" em destaque, estilo neutro.
function ServiceActions({
  service,
  onEdit,
}: {
  service: ServiceItem;
  onEdit: (service: ServiceItem) => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-start gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Alterar ${service.name}`}
        title="Alterar"
        onClick={() => onEdit(service)}
      >
        <Pencil aria-hidden="true" />
      </Button>
    </div>
  );
}

export function ServiceList({ services, search, footer }: ServiceListProps) {
  // O serviço fica guardado ao fechar, para o dialog não trocar de título
  // durante a animação de saída.
  const [editing, setEditing] = useState<ServiceItem>();
  const [editOpen, setEditOpen] = useState(false);

  function edit(service: ServiceItem) {
    setEditing(service);
    setEditOpen(true);
  }
  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {services.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {search
              ? `Nenhum serviço encontrado para “${search}”.`
              : "Nenhum serviço cadastrado. Cadastre o primeiro!"}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {services.map((service) => (
                <li key={service.id} className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{service.name}</p>
                    <ServiceActions service={service} onEdit={edit} />
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm [&_dd]:whitespace-nowrap">
                    <dt className="text-muted-foreground">Preço</dt>
                    <dd className="tabular-nums">
                      <Value>
                        {service.price && formatPrice(service.price)}
                      </Value>
                    </dd>
                    <dt className="text-muted-foreground">Duração</dt>
                    <dd className="tabular-nums">
                      {formatDuration(service.duration)}
                    </dd>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <StatusBadge service={service} />
                    </dd>
                  </dl>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  <th scope="col" className={headerClass}>
                    Nome
                  </th>
                  <th scope="col" className={headerClass}>
                    Preço
                  </th>
                  <th scope="col" className={headerClass}>
                    Duração
                  </th>
                  <th scope="col" className={headerClass}>
                    Status
                  </th>
                  <th scope="col" className={headerClass}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-background">
                    <td className="px-4 py-3 font-medium">{service.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      <Value>
                        {service.price && formatPrice(service.price)}
                      </Value>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {formatDuration(service.duration)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge service={service} />
                    </td>
                    <td className="px-4 py-2">
                      <ServiceActions service={service} onEdit={edit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <ServiceFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        service={editing}
      />
    </div>
  );
}
