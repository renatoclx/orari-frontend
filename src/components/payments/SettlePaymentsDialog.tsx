"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { settlePaymentsAction } from "@/app/(admin)/payment-actions";
import { describePayment } from "@/components/payments/PaymentDescription";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentItem } from "@/types/payment";
import type { PaymentMethodItem } from "@/types/payment-method";
import { formatPrice } from "@/utils/format";

type SettlePaymentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pagamentos da baixa (um ou vários, todos do mesmo cliente); ficam guardados ao fechar. */
  payments: PaymentItem[];
  /** Métodos ativos. */
  methods: PaymentMethodItem[];
  timeZone: string;
  /** Hoje no fuso da empresa, "aaaa-mm-dd": é a data padrão e o limite. */
  today: string;
  /** A baixa deu certo: a lista limpa a seleção. */
  onSettled: () => void;
};

/** Dar baixa em um ou mais pagamentos (screens/financeiro.md, "Dar baixa"). */
export function SettlePaymentsDialog({
  open,
  onOpenChange,
  payments,
  ...rest
}: SettlePaymentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* O conteúdo só existe com pagamentos: método e data começam do zero. */}
        {payments.length > 0 && (
          <SettleForm
            key={payments.map((payment) => payment.id).join()}
            payments={payments}
            onDone={() => onOpenChange(false)}
            {...rest}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Soma em centavos: somar decimais direto acumula erro de ponto flutuante.
function sumCents(payments: PaymentItem[]): number {
  return payments.reduce(
    (total, payment) => total + Math.round(Number(payment.amount) * 100),
    0,
  );
}

function SettleForm({
  payments,
  methods,
  timeZone,
  today,
  onSettled,
  onDone,
}: Omit<SettlePaymentsDialogProps, "open" | "onOpenChange"> & {
  onDone: () => void;
}) {
  const [methodId, setMethodId] = useState("");
  const [paidDate, setPaidDate] = useState(today);
  const [errors, setErrors] = useState<{ method?: string; paidAt?: string }>(
    {},
  );
  const [pending, startTransition] = useTransition();

  const batch = payments.length > 1;
  const total = sumCents(payments) / 100;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!methodId) {
      setErrors({ method: "Escolha o método de pagamento." });
      return;
    }

    startTransition(async () => {
      const result = await settlePaymentsAction({
        paymentIds: payments.map((payment) => payment.id),
        paymentMethodId: methodId,
        paidDate: paidDate || undefined,
      });
      if (result.ok) {
        toast.success(batch ? "Baixa realizada." : "Pagamento baixado.", {
          description: `${payments[0].client.name} · ${formatPrice(total)}`,
        });
        onSettled();
        onDone();
        return;
      }
      if (result.field === "paidAt") setErrors({ paidAt: result.message });
      toast.error("Não foi possível dar baixa.", {
        description: result.message,
      });
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {batch ? "Dar baixa em lote" : "Dar baixa no pagamento"}
        </DialogTitle>
        <DialogDescription>{payments[0].client.name}</DialogDescription>
      </DialogHeader>

      <ul className="max-h-56 divide-y divide-border overflow-auto rounded-control border border-border">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
          >
            <span>{describePayment(payment, timeZone)}</span>
            <span className="tabular-nums">{formatPrice(payment.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-base font-semibold tabular-nums">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <FormField
        id="settle-method"
        label="Método de pagamento"
        required
        error={errors.method}
      >
        <Select
          value={methodId}
          onValueChange={(value) => {
            setMethodId(value);
            setErrors({});
          }}
        >
          <SelectTrigger
            id="settle-method"
            className="w-full"
            aria-invalid={errors.method ? true : undefined}
          >
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {methods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      {methods.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum método de pagamento ativo. Cadastre um em Financeiro → Métodos
          de pagamento.
        </p>
      )}

      <FormField
        id="settle-date"
        label="Data do pagamento"
        error={errors.paidAt}
      >
        <DatePicker
          id="settle-date"
          name="paidDate"
          maxDate={new Date(`${today}T12:00:00`)}
          initialValue={today}
          onValueChange={(value) => {
            setPaidDate(value);
            setErrors({});
          }}
        />
      </FormField>

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
          <Check aria-hidden="true" />
          {pending ? "Confirmando…" : "Confirmar baixa"}
        </Button>
      </DialogFooter>
    </form>
  );
}
