"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removePaymentAction } from "@/app/(admin)/subscription-payment-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { methodLabel } from "@/components/subscription-payments/payment-form";
import { Button } from "@/components/ui/button";
import type { SubscriptionPaymentItem } from "@/types/subscription-payment";
import { formatDateOnly, formatPrice } from "@/utils/format";

const period = (item: SubscriptionPaymentItem) =>
  `${formatDateOnly(item.periodStart)} a ${formatDateOnly(item.periodEnd)}`;

/**
 * Pagamentos do mês: tabela (computador) ou cartões (celular). "Excluir" só
 * no último pagamento de cada empresa (o lançado por engano).
 */
export function PaymentsList({ items }: { items: SubscriptionPaymentItem[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<SubscriptionPaymentItem | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function confirmRemove() {
    if (!removing) return;
    const target = removing;
    startTransition(async () => {
      const result = await removePaymentAction(target.companyId, target.id);
      if (!result.ok) {
        toast.error("Não foi possível excluir o pagamento.", {
          description: result.message,
        });
        return;
      }
      toast.success("Pagamento excluído.", {
        description: `${target.companyName} voltou a ficar paga só até onde estava antes dele.`,
      });
      setRemoving(null);
      router.refresh();
    });
  }

  const remove = (item: SubscriptionPaymentItem) =>
    item.removable ? (
      <Hint label="Excluir o pagamento (lançado por engano)">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Excluir o pagamento de ${item.companyName}`}
          onClick={() => setRemoving(item)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </Hint>
    ) : null;

  const company = (item: SubscriptionPaymentItem) => (
    <Link href={`/assinaturas/${item.companyId}`} className="hover:underline">
      {item.companyName}
    </Link>
  );

  return (
    <ListCard
      columns={["Pago em", "Empresa", "Cobre", "Forma", "Valor", "Ações"]}
      emptyMessage={
        items.length > 0 ? undefined : "Nenhum pagamento neste mês."
      }
      cards={items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 p-4 text-sm">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="flex justify-between gap-3">
              <span className="font-medium">{company(item)}</span>
              <span className="font-medium tabular-nums">
                {formatPrice(item.amount)}
              </span>
            </p>
            <p className="text-muted-foreground tabular-nums">
              {methodLabel(item.method)} · pago em {formatDateOnly(item.paidAt)}
            </p>
            <p className="text-muted-foreground tabular-nums">
              Cobre de {period(item)}
            </p>
          </div>
          {remove(item)}
        </li>
      ))}
      rows={items.map((item) => (
        <tr key={item.id} className="hover:bg-background">
          <td className="px-4 py-3 whitespace-nowrap tabular-nums">
            {formatDateOnly(item.paidAt)}
          </td>
          <td className="px-4 py-3 font-medium">
            {company(item)}
            {item.note && (
              <span className="block text-xs font-normal text-muted-foreground">
                {item.note}
              </span>
            )}
          </td>
          <td className="px-4 py-3 whitespace-nowrap tabular-nums">
            {period(item)}
          </td>
          <td className="px-4 py-3">{methodLabel(item.method)}</td>
          <td className="px-4 py-3 whitespace-nowrap tabular-nums">
            {formatPrice(item.amount)}
          </td>
          <td className="px-4 py-2">{remove(item)}</td>
        </tr>
      ))}
    >
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Excluir pagamento?"
        description={
          removing &&
          `O pagamento de ${formatPrice(removing.amount)} de ${removing.companyName} é apagado, e a empresa volta a ficar paga só até onde estava antes dele.`
        }
        confirmLabel="Excluir"
        pendingLabel="Excluindo…"
        pending={pending}
        destructive
        icon={Trash2}
        onConfirm={confirmRemove}
      />
    </ListCard>
  );
}
