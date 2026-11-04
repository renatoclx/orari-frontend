"use client";

import {
  limitWarning,
  type LimitErrors,
  type LimitValues,
} from "@/components/companies/company-access";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import type { CompanyUsage } from "@/types/company-access";

type AccessLimitsProps = {
  values: LimitValues;
  errors: LimitErrors;
  usage: CompanyUsage;
  onChange: (field: keyof LimitValues, value: string) => void;
};

const FIELDS = [
  {
    field: "professionals",
    label: "Profissionais (incluindo o administrador que atua)",
  },
  { field: "admins", label: "Administradores (usuários com acesso)" },
] as const;

/** Os dois limites da empresa, com o uso atual e o aviso de limite abaixo do uso. */
export function AccessLimits({
  values,
  errors,
  usage,
  onChange,
}: AccessLimitsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map(({ field, label }) => {
        const warning = limitWarning(values[field], usage[field]);
        return (
          <FormField
            key={field}
            id={`access-${field}`}
            label={label}
            error={errors[field]}
          >
            <Input
              id={`access-${field}`}
              inputMode="numeric"
              value={values[field]}
              aria-invalid={Boolean(errors[field])}
              aria-describedby={`access-${field}-hint`}
              onChange={(event) => onChange(field, event.target.value)}
            />
            <p
              id={`access-${field}-hint`}
              className="text-sm text-muted-foreground"
            >
              Em uso: {usage[field]}
              {warning && <span className="block">{warning}</span>}
            </p>
          </FormField>
        );
      })}
    </div>
  );
}
