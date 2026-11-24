"use client";

import { useEffect, useState, useTransition } from "react";
import { HandCoins, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  getCompanyPaymentsAction,
  removePaymentAction,
} from "@/app/(admin)/subscription-payment-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { PaymentForm } from "@/components/subscription-payments/PaymentForm";
import { methodLabel } from "@/components/subscription-payments/payment-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CompanyPayments,
  SubscriptionPaymentItem,
} from "@/types/subscription-payment";
import { formatDateOnly, formatPrice } from "@/utils/format";

type CompanyPaymentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Guardada por quem abre, para o título não mudar ao fechar. */
  company?: { id: string; name: string };
  /** Abre direto no formulário de registro (ex.: pela tela Cobranças). */
  startOnForm?: boolean;
};

/**
 * Pagamentos da assinatura de uma empresa (screens/cobrancas.md): o histórico,
 * do mais recente ao mais antigo, com "Excluir" só no último, e o registro de
 * um novo pagamento. Busca ao abrir.
 */
export function CompanyPaymentsDialog({
  open,
  onOpenChange,
  company,
  startOnForm = false,
}: CompanyPaymentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {/* A chave refaz a busca a cada empresa; fechado, nada fica montado. */}
        {company && (
          <Payments
            key={company.id}
            company={company}
            startOnForm={startOnForm}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hoje no fuso do navegador (o SUPER_ADMIN está no Brasil).
function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

function Payments({
  company,
  startOnForm,
  onClose,
}: {
  company: { id: string; name: string };
  startOnForm: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<CompanyPayments>();
  const [loadError, setLoadError] = useState<string>();
  // Muda para buscar de novo (depois de registrar, excluir ou "Tentar de novo").
  const [version, setVersion] = useState(0);
  const [onForm, setOnForm] = useState(startOnForm);
  const [removing, setRemoving] = useState<SubscriptionPaymentItem | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let current = true;
    getCompanyPaymentsAction(company.id).then((result) => {
      if (!current) return;
      if (result.ok) {
        setData(result.data);
        setLoadError(undefined);
      } else {
        setLoadError(result.message);
      }
    });
    return () => {
      current = false;
    };
  }, [company.id, version]);

  function confirmRemove() {
    if (!removing) return;
    const target = removing;
    startTransition(async () => {
      const result = await removePaymentAction(company.id, target.id);
      if (!result.ok) {
        toast.error("Não foi possível excluir o pagamento.", {
          description: result.message,
        });
        return;
      }
      toast.success("Pagamento excluído.", {
        description:
          "A empresa voltou a ficar paga só até onde estava antes dele.",
      });
      setRemoving(null);
      setVersion((value) => value + 1);
    });
  }

  const header = (
    <DialogHeader>
      <DialogTitle>
        {onForm ? "Registrar pagamento" : "Pagamentos da assinatura"}
      </DialogTitle>
      <DialogDescription>{company.name}</DialogDescription>
    </DialogHeader>
  );

  if (loadError) {
    return (
      <>
        {header}
        <div role="alert" className="space-y-3 py-6 text-center text-sm">
          <p className="text-destructive">{loadError}</p>
          <Button
            variant="outline"
            onClick={() => {
              setLoadError(undefined);
              setVersion((value) => value + 1);
            }}
          >
            <RotateCcw aria-hidden="true" />
            Tentar de novo
          </Button>
        </div>
      </>
    );
  }
  if (!data) {
    return (
      <>
        {header}
        <div className="space-y-2 py-2" aria-label="Buscando…">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </>
    );
  }

  if (onForm) {
    return (
      <>
        {header}
        {data.suggestion === null ? (
          <p className="py-4 text-sm text-muted-foreground">
            A empresa ainda não tem assinatura: crie a assinatura antes de
            registrar pagamentos.
          </p>
        ) : (
          <PaymentForm
            companyId={company.id}
            companyName={company.name}
            suggestion={data.suggestion}
            todayIso={todayIso()}
            onBack={() => (startOnForm ? onClose() : setOnForm(false))}
            onSaved={() => {
              if (startOnForm) {
                onClose();
                return;
              }
              setOnForm(false);
              setVersion((value) => value + 1);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      {header}
      {data.items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum pagamento registrado.
        </p>
      ) : (
        <ul className="max-h-80 divide-y divide-border overflow-y-auto rounded-control border border-border text-sm">
          {data.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-medium tabular-nums">
                    {formatPrice(item.amount)}
                  </span>
                  <span className="text-muted-foreground">
                    {methodLabel(item.method)} · pago em{" "}
                    {formatDateOnly(item.paidAt)}
                  </span>
                </p>
                <p className="text-muted-foreground tabular-nums">
                  Cobre de {formatDateOnly(item.periodStart)} a{" "}
                  {formatDateOnly(item.periodEnd)}
                  {item.note && ` · ${item.note}`}
                </p>
              </div>
              {item.removable && (
                <Hint label="Excluir o pagamento (lançado por engano)">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir o pagamento de ${formatPrice(item.amount)}`}
                    onClick={() => setRemoving(item)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </Hint>
              )}
            </li>
          ))}
        </ul>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          <X aria-hidden="true" />
          Fechar
        </Button>
        <Button
          onClick={() => setOnForm(true)}
          disabled={data.suggestion === null}
        >
          <HandCoins aria-hidden="true" />
          Registrar pagamento
        </Button>
      </DialogFooter>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Excluir pagamento?"
        description={
          removing &&
          `O pagamento de ${formatPrice(removing.amount)} (${formatDateOnly(removing.paidAt)}) é apagado, e a empresa volta a ficar paga só até onde estava antes dele.`
        }
        confirmLabel="Excluir"
        pendingLabel="Excluindo…"
        pending={pending}
        destructive
        icon={Trash2}
        onConfirm={confirmRemove}
      />
    </>
  );
}
