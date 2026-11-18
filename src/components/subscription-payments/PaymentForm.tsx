"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { createPaymentAction } from "@/app/(admin)/subscription-payment-actions";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { MaskedInput } from "@/components/shared/MaskedInput";
import {
  PAYMENT_METHODS,
  initialPaymentValues,
  validatePaymentForm,
  type PaymentFormErrors,
  type PaymentFormValues,
} from "@/components/subscription-payments/payment-form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  PaymentSuggestion,
  SubscriptionPaymentMethod,
} from "@/types/subscription-payment";
import { maskCurrency } from "@/utils/masks";

// O calendário navega a partir daqui (os pagamentos são deste ano em diante).
const CALENDAR_START = new Date(2026, 0, 1);

/**
 * Registrar um pagamento (dentro do diálogo de pagamentos da empresa): já vem
 * com o próximo período do ciclo e o valor sugeridos, pago hoje, no Pix.
 */
export function PaymentForm({
  companyId,
  companyName,
  suggestion,
  todayIso,
  onBack,
  onSaved,
}: {
  companyId: string;
  companyName: string;
  suggestion: PaymentSuggestion | null;
  /** Hoje ("aaaa-mm-dd"), a data inicial do pagamento. */
  todayIso: string;
  /** Voltar ao histórico; sem ele, o botão é "Cancelar" e fecha. */
  onBack: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState(() =>
    initialPaymentValues(suggestion, todayIso),
  );
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [pending, startTransition] = useTransition();

  function set<K extends keyof PaymentFormValues>(
    key: K,
    value: PaymentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validatePaymentForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    startTransition(async () => {
      const result = await createPaymentAction(companyId, values);
      if (!result.ok) {
        toast.error("Não foi possível registrar o pagamento.", {
          description: result.message,
        });
        return;
      }
      toast.success("Pagamento registrado.", { description: companyName });
      onSaved();
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="relative space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="payment-amount"
          label="Valor"
          required
          error={errors.amountCents}
        >
          <MaskedInput
            id="payment-amount"
            mask={maskCurrency}
            value={values.amountCents}
            onValueChange={(digits) => set("amountCents", digits)}
            inputMode="numeric"
            placeholder="R$ 0,00"
            aria-invalid={errors.amountCents ? true : undefined}
          />
        </FormField>
        <FormField id="payment-method" label="Forma" required>
          <Select
            value={values.method}
            onValueChange={(method) =>
              set("method", method as SubscriptionPaymentMethod)
            }
          >
            <SelectTrigger id="payment-method" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.key} value={method.key}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField
          id="payment-paidAt"
          label="Pago em"
          required
          error={errors.paidAt}
        >
          <DatePicker
            id="payment-paidAt"
            name="paidAt"
            minDate={CALENDAR_START}
            initialValue={values.paidAt}
            onValueChange={(value) => set("paidAt", value)}
          />
        </FormField>
        <div className="hidden sm:block" aria-hidden="true" />
        <FormField
          id="payment-periodStart"
          label="Período de"
          required
          error={errors.periodStart}
        >
          <DatePicker
            id="payment-periodStart"
            name="periodStart"
            minDate={CALENDAR_START}
            initialValue={values.periodStart}
            onValueChange={(value) => set("periodStart", value)}
          />
        </FormField>
        <FormField
          id="payment-periodEnd"
          label="Até"
          required
          error={errors.periodEnd}
        >
          <DatePicker
            id="payment-periodEnd"
            name="periodEnd"
            minDate={CALENDAR_START}
            initialValue={values.periodEnd}
            onValueChange={(value) => set("periodEnd", value)}
          />
        </FormField>
      </div>
      <p className="text-xs text-muted-foreground">
        O pago até da assinatura passa a ser o fim do período (se for depois do
        atual).
      </p>
      <FormField id="payment-note" label="Observação">
        <Textarea
          id="payment-note"
          className="min-h-20"
          value={values.note}
          onChange={(event) => set("note", event.target.value)}
          placeholder="Ex.: comprovante enviado pelo WhatsApp"
        />
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={pending}
        >
          <ArrowLeft aria-hidden="true" />
          Voltar
        </Button>
        <Button type="submit" disabled={pending}>
          <HandCoins aria-hidden="true" />
          {pending ? "Registrando…" : "Registrar pagamento"}
        </Button>
      </DialogFooter>
    </form>
  );
}
