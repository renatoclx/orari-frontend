"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { appRegisterAction } from "@/app/app/actions";
import { AppField } from "@/components/client-app/AppField";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { Button } from "@/components/ui/button";

/** Criar a conta do app: nome, telefone e senha (screens/app-cliente.md). */
export function AppRegisterForm() {
  const [state, action, pending] = useActionState(appRegisterAction, undefined);
  return (
    <form action={action} noValidate className="space-y-4">
      {state?.message && <AppFormMessage>{state.message}</AppFormMessage>}
      <AppField
        name="name"
        label="Nome"
        autoComplete="name"
        defaultValue={state?.values.name}
        error={state?.fieldErrors.name}
      />
      <AppField
        name="phone"
        label="Telefone (com DDD)"
        type="tel"
        autoComplete="tel"
        defaultValue={state?.values.phone}
        error={state?.fieldErrors.phone}
      />
      <AppField
        name="password"
        label="Senha (mínimo de 8 caracteres)"
        type="password"
        autoComplete="new-password"
        error={state?.fieldErrors.password}
      />
      <AppField
        name="passwordConfirmation"
        label="Confirmar a senha"
        type="password"
        autoComplete="new-password"
        error={state?.fieldErrors.confirmation}
      />
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-base"
      >
        <UserPlus aria-hidden="true" />
        {pending ? "Criando…" : "Criar conta"}
      </Button>
    </form>
  );
}
