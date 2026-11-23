"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, CircleAlert, MailCheck, Send } from "lucide-react";
import { forgotPasswordAction } from "@/app/(auth)/esqueci-senha/actions";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * "Esqueci minha senha" (screens/login.md): pede o e-mail e mostra sempre a
 * mesma confirmação, exista a conta ou não (a API também não revela).
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);
    startTransition(async () => {
      const result = await forgotPasswordAction(email);
      if (result.ok) {
        setSentTo(email.trim());
        return;
      }
      if (result.field === "email") {
        setError(result.message);
        document.getElementById("forgot-email")?.focus();
      } else {
        setMessage(result.message);
      }
    });
  }

  if (sentTo) {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="flex items-start gap-3 rounded-control border border-border bg-muted px-4 py-3 text-sm"
        >
          <MailCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            Se <strong>{sentTo}</strong> estiver cadastrado no Orari, enviamos
            um link para você criar uma senha nova. O link vale por 1 hora. Não
            chegou? Confira a caixa de spam.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <ArrowLeft aria-hidden="true" />
            Voltar para o login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-control border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
      <FormField id="forgot-email" label="E-mail" required error={error}>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nome@empresa.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(undefined);
          }}
          aria-invalid={error ? true : undefined}
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        <Send aria-hidden="true" />
        {pending ? "Enviando…" : "Enviar o link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Lembrou?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
