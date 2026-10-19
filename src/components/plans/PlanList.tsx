"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Ban,
  CircleCheck,
  EllipsisVertical,
  Eye,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { setPlanActiveAction } from "@/app/(admin)/plan-actions";
import { describeMonths } from "@/components/plans/plan-pricing";
import { PlanPricingTable } from "@/components/plans/PlanPricingTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Hint } from "@/components/shared/Hint";
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
import type { PlanItem } from "@/types/plan";
import { formatPrice } from "@/utils/format";

type PlanListProps = {
  plans: PlanItem[];
  /** Há busca ou filtro aplicado, para a mensagem de lista vazia. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

// "Pilates 2×/sem, Quiropraxia 1×/sem"
const servicesOf = (plan: PlanItem) =>
  plan.services
    .map((service) => `${service.name} ${service.sessionsPerWeek}×/sem`)
    .join(", ");
const periodsOf = (plan: PlanItem) =>
  describeMonths(plan.periods.map((period) => period.months));

type RowHandlers = {
  onView: (plan: PlanItem) => void;
  onDeactivate: (plan: PlanItem) => void;
  onActivate: (plan: PlanItem) => void;
  /** Há uma ativação em andamento. */
  busy: boolean;
};

// Coluna Ações (screen-patterns.md): "Alterar" em destaque; as demais no menu
// de três pontos. Plano não é excluído: só inativado e reativado.
function PlanActions({
  plan,
  onView,
  onDeactivate,
  onActivate,
  busy,
}: { plan: PlanItem } & RowHandlers) {
  return (
    <div className="flex shrink-0 items-center justify-start gap-1">
      <Hint label={`Alterar ${plan.name}`}>
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label={`Alterar ${plan.name}`}
        >
          <Link href={`/pacotes/planos/${plan.id}/editar`}>
            <Pencil aria-hidden="true" />
          </Link>
        </Button>
      </Hint>

      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Hint label={`Mais ações para ${plan.name}`}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Mais ações para ${plan.name}`}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </Hint>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(plan)}>
            <Eye aria-hidden="true" />
            Visualizar
          </DropdownMenuItem>
          {plan.isActive ? (
            <DropdownMenuItem onSelect={() => onDeactivate(plan)}>
              <Ban aria-hidden="true" />
              Inativar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={busy} onSelect={() => onActivate(plan)}>
              <CircleCheck aria-hidden="true" />
              Ativar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Conteúdo do dialog de visualização.
function PlanDetails({ plan }: { plan: PlanItem }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{plan.name}</DialogTitle>
        <DialogDescription>
          <EmptyValue>{plan.description}</EmptyValue>
        </DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Valor mensal</dt>
        <dd className="tabular-nums">{formatPrice(plan.monthlyPrice)}</dd>
        <dt className="text-muted-foreground">Serviços</dt>
        <dd>
          {plan.services.map((service, index) => (
            <span key={service.id}>
              {index > 0 && ", "}
              {service.name} ({service.sessionsPerWeek}× por semana)
              {!service.isActive && (
                <span className="text-destructive"> (inativo)</span>
              )}
            </span>
          ))}
        </dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>
          <StatusBadge active={plan.isActive} />
        </dd>
      </dl>

      {plan.periods.length > 0 ? (
        <div className="rounded-control border border-border">
          <PlanPricingTable
            monthlyPrice={plan.monthlyPrice}
            periods={plan.periods}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Sem períodos: o plano só pode ser contratado depois de ter ao menos
          um.
        </p>
      )}
    </>
  );
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function PlanList({ plans, filtered, footer }: PlanListProps) {
  const [viewing, setViewing] = useState<PlanItem | null>(null);
  const [deactivating, setDeactivating] = useState<PlanItem | null>(null);
  const [pending, startTransition] = useTransition();
  const [activating, startActivate] = useTransition();

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;
    startTransition(async () => {
      const result = await setPlanActiveAction(target.id, false);
      if (result.ok) {
        toast.success("Plano inativado.", { description: target.name });
        setDeactivating(null);
      } else {
        toast.error("Não foi possível inativar o plano.", {
          description: result.message,
        });
      }
    });
  }

  function activate(plan: PlanItem) {
    startActivate(async () => {
      const result = await setPlanActiveAction(plan.id, true);
      if (result.ok) {
        toast.success("Plano ativado.", { description: plan.name });
      } else {
        toast.error("Não foi possível ativar o plano.", {
          description: result.message,
        });
      }
    });
  }

  const handlers: RowHandlers = {
    onView: setViewing,
    onDeactivate: setDeactivating,
    onActivate: activate,
    busy: activating,
  };
  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {plans.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {filtered
              ? "Nenhum plano encontrado para a busca ou o filtro."
              : "Nenhum plano cadastrado. Cadastre o primeiro!"}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {plans.map((plan) => (
                <li key={plan.id} className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{plan.name}</p>
                    <PlanActions plan={plan} {...handlers} />
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                    <dt className="text-muted-foreground">Serviços</dt>
                    <dd>{servicesOf(plan)}</dd>
                    <dt className="text-muted-foreground">Valor mensal</dt>
                    <dd className="tabular-nums">
                      {formatPrice(plan.monthlyPrice)}
                    </dd>
                    <dt className="text-muted-foreground">Períodos</dt>
                    <dd>
                      <EmptyValue>{periodsOf(plan)}</EmptyValue>
                    </dd>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <StatusBadge active={plan.isActive} />
                    </dd>
                  </dl>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  {[
                    "Nome",
                    "Serviços",
                    "Valor mensal",
                    "Períodos",
                    "Status",
                    "Ações",
                  ].map((title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-background">
                    <td className="px-4 py-3 font-medium">{plan.name}</td>
                    <td className="px-4 py-3">{servicesOf(plan)}</td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {formatPrice(plan.monthlyPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <EmptyValue>{periodsOf(plan)}</EmptyValue>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={plan.isActive} />
                    </td>
                    <td className="px-4 py-2">
                      <PlanActions plan={plan} {...handlers} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="sm:max-w-xl">
          {viewing && <PlanDetails plan={viewing} />}
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
        title="Inativar plano?"
        description={`O plano ${deactivating?.name ?? ""} ficará inativo e não poderá ser contratado. As contratações já feitas continuam valendo. Você poderá ativá-lo novamente.`}
        confirmLabel="Inativar"
        pendingLabel="Inativando…"
        icon={Ban}
        pending={pending}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
