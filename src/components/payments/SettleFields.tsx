"use client";

import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentMethodItem } from "@/types/payment-method";

type SettleFieldsProps = {
  /** Métodos ativos. */
  methods: PaymentMethodItem[];
  methodId: string;
  onMethodChange: (id: string) => void;
  methodError?: string;
  /** Hoje no fuso da empresa, "aaaa-mm-dd": é a data inicial e o limite. */
  today: string;
  onDateChange: (value: string) => void;
  dateError?: string;
  /** Prefixo dos ids, para dois formulários não repetirem o mesmo id. */
  idPrefix: string;
};

/** Método e data do pagamento: os campos comuns às baixas (pagamentos e comandas). */
export function SettleFields({
  methods,
  methodId,
  onMethodChange,
  methodError,
  today,
  onDateChange,
  dateError,
  idPrefix,
}: SettleFieldsProps) {
  return (
    <>
      <FormField
        id={`${idPrefix}-method`}
        label="Método de pagamento"
        required
        error={methodError}
      >
        <Select value={methodId} onValueChange={onMethodChange}>
          <SelectTrigger
            id={`${idPrefix}-method`}
            className="w-full"
            aria-invalid={methodError ? true : undefined}
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
        id={`${idPrefix}-date`}
        label="Data do pagamento"
        error={dateError}
      >
        <DatePicker
          id={`${idPrefix}-date`}
          name="paidDate"
          maxDate={new Date(`${today}T12:00:00`)}
          initialValue={today}
          onValueChange={onDateChange}
        />
      </FormField>
    </>
  );
}
