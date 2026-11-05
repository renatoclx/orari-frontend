"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskPhone } from "@/utils/masks";

type AppFieldProps = {
  name: string;
  label: string;
  error?: string;
  type?: "text" | "password" | "tel";
  autoComplete?: string;
  defaultValue?: string;
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
}: AppFieldProps) {
  const [value, setValue] = useState(
    type === "tel" ? maskPhone(defaultValue) : defaultValue,
  );
  const id = `app-${name}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        inputMode={type === "tel" ? "tel" : undefined}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) =>
          setValue(
            type === "tel" ? maskPhone(event.target.value) : event.target.value,
          )
        }
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 bg-card text-base md:text-base"
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
