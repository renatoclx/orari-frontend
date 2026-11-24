"use client";

import { HandCoins, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { settlePayablesAction } from "@/app/(admin)/payable-actions";
import { payableTitle } from "@/components/payables/payable-filters";
import { SettleFields } from "@/components/payments/SettleFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PayableItem } from "@/types/payable";
import type { PaymentMethodItem } from "@/types/payment-method";
import { formatPrice } from "@/utils/format";

type SettlePayablesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Contas do pagamento (uma ou várias); ficam guardadas ao fechar. */
  payables: PayableItem[];
  /** Métodos ativos. */
  methods: PaymentMethodItem[];
  /** Hoje no fuso da empresa ("aaaa-mm-dd"): data padrão e limite. */
  today: string;
  onSettled: () => void;
};

/** Pagar uma ou várias contas (mesma data e mesmo método). */
export function SettlePayablesDialog({
  open,
  onOpenChange,
  payables,
  ...rest
}: SettlePayablesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {payables.length > 0 && (
          <SettleForm
            key={payables.map((payable) => payable.id).join()}
            payables={payables}
            onDone={() => onOpenChange(false)}
            {...rest}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SettleForm({
  payables,
  methods,
  today,
  onSettled,
  onDone,
}: Omit<SettlePayablesDialogProps, "open" | "onOpenChange"> & {
  onDone: () => void;
}) {
  const [methodId, setMethodId] = useState("");
  const [paidAt, setPaidAt] = useState(today);
  const [methodError, setMethodError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const batch = payables.length > 1;
  // Soma em centavos: somar decimais direto acumula erro.
  const total =
    payables.reduce(
      (sum, payable) => sum + Math.round(Number(payable.amount) * 100),
      0,
    ) / 100;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!methodId) {
      setMethodError("Escolha o método de pagamento.");
      return;
    }
    startTransition(async () => {
      const result = await settlePayablesAction({
        ids: payables.map((payable) => payable.id),
        paidAt,
        paymentMethodId: methodId,
      });
      if (result.ok) {
        toast.success(batch ? "Contas pagas." : "Conta paga.", {
          description: formatPrice(total),
        });
        onSettled();
        onDone();
        return;
      }
      toast.error("Não foi possível pagar.", { description: result.message });
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{batch ? "Pagar contas" : "Pagar conta"}</DialogTitle>
        <DialogDescription>
          Registra o pagamento com a data e o método escolhidos.
        </DialogDescription>
      </DialogHeader>

      <ul className="max-h-56 divide-y divide-border overflow-auto rounded-control border border-border">
        {payables.map((payable) => (
          <li
            key={payable.id}
            className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
          >
            <span>
              {payableTitle(payable)}
              {payable.payee && (
                <span className="text-muted-foreground">
                  {" "}
                  · {payable.payee.name}
                </span>
              )}
            </span>
            <span className="tabular-nums">{formatPrice(payable.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between text-base font-semibold tabular-nums">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <SettleFields
        idPrefix="payable-settle"
        methods={methods}
        methodId={methodId}
        onMethodChange={(value) => {
          setMethodId(value);
          setMethodError(undefined);
        }}
        methodError={methodError}
        today={today}
        onDateChange={setPaidAt}
      />

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onDone}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending || methods.length === 0}>
          <HandCoins aria-hidden="true" />
          {pending ? "Pagando…" : "Confirmar pagamento"}
        </Button>
      </DialogFooter>
    </form>
  );
}
