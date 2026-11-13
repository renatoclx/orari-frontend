"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { appLoginAction } from "@/app/app/actions";
import { AppField } from "@/components/client-app/AppField";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { Button } from "@/components/ui/button";

/**
 * Entrar no app (screens/app-cliente.md e app-profissional.md): telefone ou
 * e-mail (o e-mail é só do profissional) e senha. O mesmo formulário serve ao cliente e ao profissional; quem o telefone
 * identifica é decidido na hora de entrar.
 */
export function AppLoginForm({
  returnTo,
}: {
  /** Caminho para voltar depois (a página de um estabelecimento). */
  returnTo?: string;
}) {
  const [state, action, pending] = useActionState(appLoginAction, undefined);
  return (
    <form action={action} noValidate className="space-y-4">
      {returnTo && <input type="hidden" name="voltar" value={returnTo} />}
      {state?.message && <AppFormMessage>{state.message}</AppFormMessage>}
      <AppField
        name="login"
        label="Telefone ou e-mail"
        type="login"
        autoComplete="username"
        defaultValue={state?.values.login}
        error={state?.fieldErrors.login}
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
