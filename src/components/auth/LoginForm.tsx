"use client";

import { Hint } from "@/components/shared/Hint";
import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { login } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Campos e botão maiores só no login, para leitura confortável (56 px, 16 px).
const inputClass = "h-14 bg-card text-base md:text-base";

// Ícone dentro do campo, à esquerda; não captura cliques.
const iconClass =
  "pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  const emailError = state?.fieldErrors.email;
  const passwordError = state?.fieldErrors.password;

  return (
    // noValidate: as mensagens vêm do servidor, no padrão da interface,
    // em vez dos balões do navegador.
    <form action={formAction} noValidate className="space-y-4">
      {state?.message && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-control border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <div className="relative">
          <Mail className={iconClass} aria-hidden="true" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nome@empresa.com"
            defaultValue={state?.email}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? "email-error" : undefined}
            className={`${inputClass} pl-11`}
          />
        </div>
        {emailError && (
          <p id="email-error" className="text-sm text-destructive">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <LockKeyhole className={iconClass} aria-hidden="true" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordError ? "password-error" : undefined}
            className={`${inputClass} pr-12 pl-11`}
          />
          <Hint
            label={
              showPassword
                ? "Ocultar a senha digitada"
                : "Mostrar a senha digitada"
            }
          >
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label="Mostrar senha"
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-control px-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-5" aria-hidden="true" />
              ) : (
                <Eye className="size-5" aria-hidden="true" />
              )}
            </button>
          </Hint>
        </div>
        {passwordError && (
          <p id="password-error" className="text-sm text-destructive">
            {passwordError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="mt-2 h-14 w-full text-base"
      >
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
