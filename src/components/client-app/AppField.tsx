"use client";

import { useState } from "react";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskCep, maskCpf, maskPhone } from "@/utils/masks";

type AppFieldProps = {
  name: string;
  label: string;
  error?: string;
  type?: "text" | "password" | "tel" | "email" | "date" | "cpf" | "cep";
  autoComplete?: string;
  defaultValue?: string;
  /** Valor controlado de fora (ex.: rua preenchida pelo CEP). */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Ao terminar de digitar (ex.: buscar o CEP). */
  onBlur?: () => void;
};

// Máscara de cada tipo enquanto se digita.
const MASKS: Partial<Record<string, (value: string) => string>> = {
  tel: maskPhone,
  cpf: maskCpf,
  cep: maskCep,
};

// Campo dos formulários do app: maior e com texto de 16 px (o celular não dá
// zoom ao focar). O telefone recebe a máscara enquanto se digita.
export function AppField({
  name,
  label,
  error,
  type = "text",
  autoComplete,
  defaultValue = "",
  value: controlled,
  onValueChange,
  onBlur,
}: AppFieldProps) {
  const mask = MASKS[type];
  const [own, setOwn] = useState(mask ? mask(defaultValue) : defaultValue);
  const value = controlled ?? own;
  const setValue = (next: string) => {
    const masked = mask ? mask(next) : next;
    setOwn(masked);
    onValueChange?.(masked);
  };
  const id = `app-${name}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={mask ? "text" : type}
        inputMode={type === "tel" ? "tel" : mask ? "numeric" : undefined}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-12 bg-card text-base md:text-base",
          // No iPhone, a data nativa tem largura própria e passa da tela: sem a
          // aparência nativa ela ocupa a largura do campo (o seletor continua).
          type === "date" &&
            "appearance-none [&::-webkit-date-and-time-value]:text-left",
        )}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
