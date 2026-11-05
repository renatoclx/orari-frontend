"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { appChangePasswordAction } from "@/app/app/actions";
import { AppField } from "@/components/client-app/AppField";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { Button } from "@/components/ui/button";

/** Trocar a senha do app (Menu → Segurança; screens/app-cliente.md). */
export function AppPasswordForm() {
  const [state, action, pending] = useActionState(
    appChangePasswordAction,
    undefined,
  );
  return (
    <form action={action} noValidate className="space-y-4">
      {state?.message && <AppFormMessage>{state.message}</AppFormMessage>}
      <AppField
        name="currentPassword"
        label="Senha atual"
        type="password"
        autoComplete="current-password"
        error={state?.fieldErrors.currentPassword}
      />
      <AppField
        name="password"
        label="Senha nova (mínimo de 8 caracteres)"
        type="password"
        autoComplete="new-password"
        error={state?.fieldErrors.password}
      />
      <AppField
        name="passwordConfirmation"
        label="Confirmar a senha nova"
        type="password"
        autoComplete="new-password"
        error={state?.fieldErrors.confirmation}
      />
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-base"
      >
        <KeyRound aria-hidden="true" />
        {pending ? "Salvando…" : "Trocar a senha"}
      </Button>
    </form>
  );
}
