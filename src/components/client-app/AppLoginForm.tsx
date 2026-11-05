"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { appLoginAction } from "@/app/app/actions";
import { AppField } from "@/components/client-app/AppField";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { Button } from "@/components/ui/button";

/** Entrar no app com telefone e senha (screens/app-cliente.md). */
export function AppLoginForm() {
  const [state, action, pending] = useActionState(appLoginAction, undefined);
  return (
    <form action={action} noValidate className="space-y-4">
      {state?.message && <AppFormMessage>{state.message}</AppFormMessage>}
      <AppField
        name="phone"
        label="Telefone"
        type="tel"
        autoComplete="tel"
        defaultValue={state?.values.phone}
        error={state?.fieldErrors.phone}
      />
      <AppField
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        error={state?.fieldErrors.password}
      />
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-base"
      >
        <LogIn aria-hidden="true" />
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
