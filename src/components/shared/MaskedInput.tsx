"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { onlyDigits } from "@/utils/masks";

type MaskedInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange" | "name"
> & {
  /** Formata o texto digitado para exibição (ver utils/masks.ts). */
  mask: (value: string) => string;
  /** Com `name`, o valor vai no formulário sem máscara (só dígitos). */
  name?: string;
  /** Valor controlado, sem máscara. */
  value?: string;
  /** Valor inicial (sem máscara) quando não controlado. */
  initialValue?: string;
  onValueChange?: (digits: string) => void;
};

// Campo com máscara: exibe o texto formatado, mas guarda e envia só os dígitos.
export function MaskedInput({
  mask,
  name,
  value,
  initialValue = "",
  onValueChange,
  ...props
}: MaskedInputProps) {
  const [internal, setInternal] = useState(onlyDigits(initialValue));
  const digits = value ?? internal;

  return (
    <>
      <Input
        {...props}
        value={mask(digits)}
        onChange={(event) => {
          const next = onlyDigits(mask(event.target.value));
          setInternal(next);
          onValueChange?.(next);
        }}
      />
      {name && <input type="hidden" name={name} value={digits} />}
    </>
  );
}
