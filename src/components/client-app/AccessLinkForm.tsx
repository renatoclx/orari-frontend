"use client";

import { useActionState } from "react";
import { KeyRound, LogIn, Plus } from "lucide-react";
import { appAccessLinkAction } from "@/app/app/actions";
import { AppField } from "@/components/client-app/AppField";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import type { AccessLinkMode } from "@/components/client-app/client-app";
import { Button } from "@/components/ui/button";

type AccessLinkFormProps = {
  token: string;
  mode: AccessLinkMode;
  needsPhone: boolean;
  placeName: string;
};

// Texto e ícone do botão em cada caso do link.
const SUBMIT = {
  attach: { icon: Plus, idle: "Adicionar à minha conta", busy: "Adicionando…" },
  create: { icon: LogIn, idle: "Criar senha e entrar", busy: "Entrando…" },
  reset: { icon: KeyRound, idle: "Salvar a senha nova", busy: "Salvando…" },
} as const;

/** O que o link de acesso pede, conforme o caso (screens/app-cliente.md). */
export function AccessLinkForm({
  token,
  mode,
  needsPhone,
  placeName,
}: AccessLinkFormProps) {
  const [state, action, pending] = useActionState(
    appAccessLinkAction.bind(null, token, needsPhone),
    undefined,
  );
  const submit = SUBMIT[mode];
  const Icon = submit.icon;

  return (
    <form action={action} noValidate className="space-y-4">
      {state?.message && <AppFormMessage>{state.message}</AppFormMessage>}
      {mode === "attach" ? (
        <p className="text-sm text-muted-foreground">
          Você já está no app. {placeName} passa a aparecer nos seus locais.
        </p>
      ) : (
        <>
          {needsPhone && mode === "create" && (
            <AppField
              name="phone"
              label="Telefone (com DDD)"
              type="tel"
              autoComplete="tel"
              defaultValue={state?.values.phone}
              error={state?.fieldErrors.phone}
            />
          )}
          <AppField
            name="password"
            label={mode === "reset" ? "Senha nova" : "Senha"}
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
        </>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-base"
      >
        <Icon aria-hidden="true" />
        {pending ? submit.busy : submit.idle}
      </Button>
    </form>
  );
}
