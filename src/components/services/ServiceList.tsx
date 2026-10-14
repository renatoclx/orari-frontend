"use client";

import { useState, useTransition } from "react";
import {
  Ban,
  CircleCheck,
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { setServiceActiveAction } from "@/app/(admin)/service-actions";
import { ServiceFormDialog } from "@/components/services/ServiceFormDialog";
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

type RowHandlers = {
  onView: (service: ServiceItem) => void;
  onEdit: (service: ServiceItem) => void;
  onDeactivate: (service: ServiceItem) => void;
  onActivate: (service: ServiceItem) => void;
  /** Há uma ativação em andamento. */
  busy: boolean;
};

// Coluna Ações (screen-patterns.md): "Alterar" em destaque; as demais ações no
// menu de três pontos, em ordem fixa. Estilo neutro, só ícones.
function ServiceActions({
  service,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  busy,
}: { service: ServiceItem } & RowHandlers) {
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

      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Mais ações para ${service.name}`}
          >
            <EllipsisVertical aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(service)}>
            <Eye aria-hidden="true" />
            Visualizar
          </DropdownMenuItem>
          {service.isActive ? (
            <DropdownMenuItem onSelect={() => onDeactivate(service)}>
              <Ban aria-hidden="true" />
              Inativar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={busy}
              onSelect={() => onActivate(service)}
            >
              <CircleCheck aria-hidden="true" />
              Ativar
            </DropdownMenuItem>
          )}
          {/* Exclusão entra com a regra de relacionamentos do backend. */}
          <DropdownMenuItem disabled>
            <Trash2 aria-hidden="true" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ServiceDetails({ service }: { service: ServiceItem }) {
  const rows: [string, React.ReactNode][] = [
    ["Descrição", service.description],
    ["Preço", service.price && formatPrice(service.price)],
    ["Duração", formatDuration(service.duration)],
    [
      "Cor",
      service.color && (
        <span className="inline-flex items-center gap-2">
          <span
            className="size-4 rounded-full border border-border"
            style={{ backgroundColor: service.color }}
            aria-hidden="true"
          />
          <span className="uppercase">{service.color}</span>
        </span>
      ),
    ],
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle>{service.name}</DialogTitle>
        <DialogDescription>Dados do serviço.</DialogDescription>
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
          <StatusBadge service={service} />
        </dd>
      </dl>
    </>
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

  const [viewing, setViewing] = useState<ServiceItem | null>(null);
  const [deactivating, setDeactivating] = useState<ServiceItem | null>(null);
  const [pending, startTransition] = useTransition();
  const [activating, startActivate] = useTransition();

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;

    startTransition(async () => {
      const result = await setServiceActiveAction(target.id, false);
      if (result.ok) {
        toast.success("Serviço inativado.", { description: target.name });
        setDeactivating(null);
      } else {
        toast.error("Não foi possível inativar o serviço.", {
          description: result.message,
        });
      }
    });
  }

  function activate(service: ServiceItem) {
    startActivate(async () => {
      const result = await setServiceActiveAction(service.id, true);
      if (result.ok) {
        toast.success("Serviço ativado.", { description: service.name });
      } else {
        toast.error("Não foi possível ativar o serviço.", {
          description: result.message,
        });
      }
    });
  }

  const handlers: RowHandlers = {
    onView: setViewing,
    onEdit: edit,
    onDeactivate: setDeactivating,
    onActivate: activate,
    busy: activating,
  };
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
                    <ServiceActions service={service} {...handlers} />
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
                      <ServiceActions service={service} {...handlers} />
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

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent>
          {viewing && <ServiceDetails service={viewing} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && !pending && setDeactivating(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              O serviço {deactivating?.name} ficará inativo e não poderá ser
              usado em novos agendamentos. Você poderá ativá-lo novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                // Mantém o diálogo aberto enquanto inativa ("Inativando…").
                event.preventDefault();
                confirmDeactivate();
              }}
            >
              {pending ? "Inativando…" : "Inativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
