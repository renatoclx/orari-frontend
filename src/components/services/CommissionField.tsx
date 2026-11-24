"use client";

import { useState } from "react";
import { FormField } from "@/components/shared/FormField";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CommissionType } from "@/types/service";
import { maskCurrency } from "@/utils/masks";

// O Radix não aceita valor vazio num item: "NONE" é o "Sem comissão".
const NONE = "NONE";

type CommissionFieldProps = {
  /** Id do campo de valor (recebe o foco quando há erro). */
  id: string;
  type: CommissionType | null | undefined;
  /** Texto da API (ex.: "40.00"). */
  value: string | null | undefined;
  error?: string;
};

// "40.00" → "40"; "12.50" → "12,5" (como a pessoa digitaria).
const percentText = (value: string) => String(Number(value)).replace(".", ",");

/**
 * Comissão do profissional por atendimento (só o ADMIN vê): sem comissão,
 * percentual do valor cobrado ou valor fixo. O campo de valor muda com o tipo.
 */
export function CommissionField({
  id,
  type,
  value,
  error,
}: CommissionFieldProps) {
  const [kind, setKind] = useState<string>(type ?? NONE);
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Diz à Server Action que este formulário pode mexer na comissão. */}
      <input type="hidden" name="commissionEnabled" value="1" />
      <FormField id="service-commission-type" label="Comissão do profissional">
        <Select name="commissionType" value={kind} onValueChange={setKind}>
          <SelectTrigger id="service-commission-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sem comissão</SelectItem>
            <SelectItem value="PERCENT">Percentual</SelectItem>
            <SelectItem value="FIXED">Valor fixo</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {kind === "PERCENT" && (
        <FormField id={id} label="Percentual (%)" required error={error}>
          <Input
            id={id}
            name="commissionPercent"
            inputMode="decimal"
            placeholder="40"
            defaultValue={type === "PERCENT" && value ? percentText(value) : ""}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
        </FormField>
      )}
      {kind === "FIXED" && (
        <FormField id={id} label="Valor por atendimento" required error={error}>
          <MaskedInput
            id={id}
            name="commissionCents"
            mask={maskCurrency}
            initialValue={
              type === "FIXED" && value
                ? String(Math.round(Number(value) * 100))
                : ""
            }
            inputMode="numeric"
            placeholder="R$ 0,00"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
        </FormField>
      )}
    </div>
  );
}
