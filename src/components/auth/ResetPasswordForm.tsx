"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  RotateCcw,
} from "lucide-react";
import { resetPasswordAction } from "@/app/(auth)/redefinir-senha/actions";
import { validatePassword } from "@/components/users/user-validation";
import { FormField } from "@/components/shared/FormField";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Errors = { password?: string; passwordConfirmation?: string };

/** Link que não vale (sem token, usado ou vencido): oferece pedir outro. */
export function InvalidResetLink({ message }: { message?: string }) {
  return (
    <div className="space-y-5">
      <p
        role="alert"
        className="flex items-start gap-2 rounded-control border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {message ??
          "Este link não está completo. Abra de novo o link do e-mail ou peça um novo."}
      </p>
      <Button asChild className="w-full">
        <Link href="/esqueci-senha">
          <RotateCcw aria-hidden="true" />
          Pedir um novo link
        </Link>
      </Button>
    </div>
  );
}

/**
 * Senha nova pelo link do e-mail (screens/login.md): a nova senha e a
 * confirmação. Depois, leva ao login (ou ao app, para o profissional).
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string>();
  const [invalid, setInvalid] = useState<string>();
  const [done, setDone] = useState<{ professional: boolean }>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validatePassword(password, confirmation);
    setErrors(found);
    setMessage(undefined);
    if (found.password || found.passwordConfirmation) {
      document
        .getElementById(
          found.password ? "reset-password" : "reset-confirmation",
        )
        ?.focus();
      return;
    }
    startTransition(async () => {
      const result = await resetPasswordAction({
        token,
        password,
        passwordConfirmation: confirmation,
      });
      if (result.ok) {
        setDone({ professional: result.professional });
        return;
      }
      if (result.linkInvalid) {
        setInvalid(result.message);
        return;
      }
      setErrors(result.fieldErrors);
      setMessage(result.message);
    });
  }

  if (invalid) return <InvalidResetLink message={invalid} />;

  if (done) {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="flex items-start gap-3 rounded-control border border-border bg-muted px-4 py-3 text-sm"
        >
          <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            Senha alterada! Entre com a senha nova. Por segurança, os aparelhos
            que estavam conectados precisam entrar de novo.
          </p>
        </div>
        <Button asChild className="w-full">
          {/* O profissional usa o app; os demais, o sistema. */}
          <Link href={done.professional ? "/app/entrar" : "/login"}>
            <LogIn aria-hidden="true" />
            {done.professional ? "Entrar no app" : "Entrar"}
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
      <FormField
        id="reset-password"
        label="Nova senha"
        required
        error={errors.password}
      >
        <div className="relative">
          <Input
            id="reset-password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Pelo menos 8 caracteres"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            aria-invalid={errors.password ? true : undefined}
            className="pr-11"
          />
          <Hint label={show ? "Esconder as senhas" : "Mostrar as senhas"}>
            <button
              type="button"
              onClick={() => setShow((current) => !current)}
              aria-label={show ? "Esconder as senhas" : "Mostrar as senhas"}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-control p-1.5 text-muted-foreground hover:text-foreground"
            >
              {show ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </Hint>
        </div>
      </FormField>
      <FormField
        id="reset-confirmation"
        label="Confirme a nova senha"
        required
        error={errors.passwordConfirmation}
      >
        <Input
          id="reset-confirmation"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={confirmation}
          onChange={(event) => {
            setConfirmation(event.target.value);
            setErrors((current) => ({
              ...current,
              passwordConfirmation: undefined,
            }));
          }}
          aria-invalid={errors.passwordConfirmation ? true : undefined}
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        <KeyRound aria-hidden="true" />
        {pending ? "Salvando…" : "Criar senha nova"}
      </Button>
    </form>
  );
}
