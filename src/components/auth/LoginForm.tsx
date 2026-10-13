"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { login } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-control border border-border bg-surface h-14 px-3 text-base placeholder:text-muted aria-invalid:border-danger";

const iconClass =
  "pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted";

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
          className="flex items-start gap-2 rounded-control border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <div className="relative">
          <Mail className={iconClass} aria-hidden="true" />
          <input
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
          <p id="email-error" className="text-sm text-danger">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <div className="relative">
          <LockKeyhole className={iconClass} aria-hidden="true" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordError ? "password-error" : undefined}
            className={`${inputClass} pr-12 pl-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label="Mostrar senha"
            aria-pressed={showPassword}
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex items-center rounded-r-control px-3 text-muted hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {passwordError && (
          <p id="password-error" className="text-sm text-danger">
            {passwordError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={pending}
        className="mt-2 w-full"
      >
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
