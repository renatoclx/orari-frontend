import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { CompanyPaymentsButton } from "@/components/subscription-payments/CompanyPaymentsButton";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import {
  cycleLabel,
  planLabel,
} from "@/components/subscriptions/subscription-catalog";
import { Button } from "@/components/ui/button";
import type {
  CompanySubscriptionItem,
  Subscription,
} from "@/types/subscription";
import { formatDateOnly, formatPrice } from "@/utils/format";

type SubscriptionListProps = {
  items: CompanySubscriptionItem[];
  /** Há filtro: muda a mensagem de lista vazia. */
  filtered: boolean;
};

// O que a data da situação significa em cada uma.
const ENDS_AT_LABEL: Partial<Record<Subscription["status"], string>> = {
  TRIAL: "fim do teste",
  ACTIVE: "vencimento",
  OVERDUE: "último dia antes do bloqueio",
};

// "Plus + 1 profissional + anamnese"
function planText(subscription: Subscription): string {
  const extras = subscription.extraProfessionals;
  return [
    planLabel(subscription.plan),
    extras > 0 &&
      `+ ${extras} ${extras === 1 ? "profissional" : "profissionais"}`,
    subscription.anamnesisAddon && "+ anamnese",
  ]
    .filter(Boolean)
    .join(" ");
}

function EndsAt({ subscription }: { subscription: Subscription | null }) {
  if (!subscription?.endsAt) return <EmptyValue />;
  return (
    <span className="tabular-nums">
      {formatDateOnly(subscription.endsAt)}
      <span className="block text-xs text-muted-foreground">
        {ENDS_AT_LABEL[subscription.status]}
      </span>
    </span>
  );
}

// Ação única da linha: criar ou alterar a assinatura (página de formulário).
function RowAction({ item }: { item: CompanySubscriptionItem }) {
  const creating = item.subscription === null;
  const label = `${creating ? "Criar a assinatura de" : "Alterar a assinatura de"} ${item.companyName}`;
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Hint label={label}>
        <Button asChild variant="ghost" size="icon" aria-label={label}>
          <Link href={`/assinaturas/${item.companyId}`}>
            {creating ? (
              <Plus aria-hidden="true" />
            ) : (
              <Pencil aria-hidden="true" />
            )}
          </Link>
        </Button>
      </Hint>
      {/* Pagamentos (histórico e registro): só com assinatura. */}
      {!creating && (
        <CompanyPaymentsButton
          company={{ id: item.companyId, name: item.companyName }}
        />
      )}
    </div>
  );
}

function CompanyName({ item }: { item: CompanySubscriptionItem }) {
  return (
    <>
      {item.companyName}
      {!item.isActive && (
        <span className="ml-2 text-xs text-muted-foreground">(inativa)</span>
      )}
    </>
  );
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function SubscriptionList({ items, filtered }: SubscriptionListProps) {
  return (
    <ListCard
      columns={[
        "Empresa",
        "Plano",
        "Ciclo",
        "Valor",
        "Situação",
        "Data",
        "Ações",
      ]}
      emptyMessage={
        items.length > 0
          ? undefined
          : filtered
            ? "Nenhuma empresa nesta situação."
            : "Nenhuma empresa cadastrada."
      }
      cards={items.map((item) => (
        <li key={item.companyId} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">
                <CompanyName item={item} />
              </p>
              {item.subscription && (
                <p className="text-sm text-muted-foreground">
                  {planText(item.subscription)} ·{" "}
                  {cycleLabel(item.subscription.cycle)} ·{" "}
                  {formatPrice(item.subscription.price)}
                </p>
              )}
            </div>
            <RowAction item={item} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <SubscriptionStatusBadge
              status={item.subscription?.status ?? null}
            />
            {item.subscription?.endsAt && (
              <EndsAt subscription={item.subscription} />
            )}
          </div>
        </li>
      ))}
      rows={items.map((item) => (
        <tr key={item.companyId} className="hover:bg-background">
          <td className="px-4 py-3 font-medium">
            <CompanyName item={item} />
          </td>
          <td className="px-4 py-3">
            <EmptyValue>
              {item.subscription && planText(item.subscription)}
            </EmptyValue>
          </td>
          <td className="px-4 py-3">
            <EmptyValue>
              {item.subscription && cycleLabel(item.subscription.cycle)}
            </EmptyValue>
          </td>
          <td className="px-4 py-3 whitespace-nowrap tabular-nums">
            <EmptyValue>
              {item.subscription && formatPrice(item.subscription.price)}
            </EmptyValue>
          </td>
          <td className="px-4 py-3">
            <SubscriptionStatusBadge
              status={item.subscription?.status ?? null}
            />
          </td>
          <td className="px-4 py-3">
            <EndsAt subscription={item.subscription} />
          </td>
          <td className="px-4 py-2">
            <RowAction item={item} />
          </td>
        </tr>
      ))}
    />
  );
}
