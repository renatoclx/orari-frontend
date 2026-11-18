"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CircleAlert, Eye, EyeOff, Rocket } from "lucide-react";
import { signupAction } from "@/app/(auth)/cadastro/actions";
import {
  validateSignup,
  type SignupErrors,
  type SignupValues,
} from "@/components/auth/signup-validation";
import { FormField } from "@/components/shared/FormField";
import { Hint } from "@/components/shared/Hint";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { PLANS } from "@/components/subscriptions/subscription-catalog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { SubscriptionPlan } from "@/types/subscription";
import { formatPrice } from "@/utils/format";
import { maskCpfOrCnpj, maskPhone } from "@/utils/masks";

// Uma linha sobre cada plano, como na landing.
const PLAN_SUMMARY: Record<SubscriptionPlan, string> = {
  ESSENTIAL: "Até 2 profissionais: agenda, clientes, app e comandas.",
  PLUS: "Até 4 profissionais: tudo, menos anamnese e turmas.",
  CLINICAL: "3 profissionais: tudo, com anamnese e turmas.",
};

/**
 * Cadastro sozinho (screens/cadastro.md): o negócio, quem administra, o plano
 * do teste e o aceite dos termos. Valida na tela e de novo no servidor; com
 * sucesso, a Server Action entra no sistema.
 */
export function SignupForm({ initialPlan }: { initialPlan: SubscriptionPlan }) {
  const [values, setValues] = useState<SignupValues>({
    companyName: "",
    document: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    plan: initialPlan,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [message, setMessage] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof SignupValues>(key: K, value: SignupValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateSignup(values);
    setErrors(found);
    setMessage(undefined);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`signup-${first}`)?.focus();
      return;
    }
    startTransition(async () => {
      // Sem erro, a action redireciona (e esta função não volta).
      const result = await signupAction(values);
      setErrors(result.fieldErrors);
      setMessage(result.message);
      const field = Object.keys(result.fieldErrors)[0];
      if (field) document.getElementById(`signup-${field}`)?.focus();
    });
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

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">
          Plano do teste <span className="text-destructive">*</span>
        </legend>
        {/* Botões de escolha (aria-pressed), como as opções de horário. */}
        <div className="grid gap-2">
          {PLANS.map((plan) => {
            const chosen = values.plan === plan.key;
            return (
              <button
                key={plan.key}
                type="button"
                aria-pressed={chosen}
                onClick={() => set("plan", plan.key)}
                className={`rounded-control border px-3 py-2.5 text-left text-sm transition-colors ${
                  chosen
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{plan.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatPrice(plan.monthly)}/mês
                  </span>
                </span>
                <span className="block text-muted-foreground">
                  {PLAN_SUMMARY[plan.key]}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          7 dias grátis, sem cartão. Depois, você escolhe se continua.
        </p>
      </fieldset>

      <FormField
        id="signup-companyName"
        label="Nome do negócio"
        required
        error={errors.companyName}
      >
        <Input
          id="signup-companyName"
          autoComplete="organization"
          placeholder="Ex.: Studio Aurora"
          value={values.companyName}
          onChange={(event) => set("companyName", event.target.value)}
          aria-invalid={errors.companyName ? true : undefined}
        />
      </FormField>
      <FormField
        id="signup-document"
        label="CPF ou CNPJ"
        required
        error={errors.document}
      >
        <MaskedInput
          id="signup-document"
          mask={maskCpfOrCnpj}
          inputMode="numeric"
          placeholder="Só os números"
          value={values.document}
          onValueChange={(digits) => set("document", digits)}
          aria-invalid={errors.document ? true : undefined}
        />
      </FormField>
      <FormField id="signup-name" label="Seu nome" required error={errors.name}>
        <Input
          id="signup-name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          aria-invalid={errors.name ? true : undefined}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="signup-email"
          label="E-mail"
          required
          error={errors.email}
        >
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nome@empresa.com"
            value={values.email}
            onChange={(event) => set("email", event.target.value)}
            aria-invalid={errors.email ? true : undefined}
          />
        </FormField>
        <FormField
          id="signup-phone"
          label="Celular (WhatsApp)"
          required
          error={errors.phone}
        >
          <MaskedInput
            id="signup-phone"
            mask={maskPhone}
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            value={values.phone}
            onValueChange={(digits) => set("phone", digits)}
            aria-invalid={errors.phone ? true : undefined}
          />
        </FormField>
      </div>
      <FormField
        id="signup-password"
        label="Senha"
        required
        error={errors.password}
      >
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Pelo menos 8 caracteres"
            value={values.password}
            onChange={(event) => set("password", event.target.value)}
            aria-invalid={errors.password ? true : undefined}
            className="pr-11"
          />
          <Hint label={showPassword ? "Esconder a senha" : "Mostrar a senha"}>
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Esconder a senha" : "Mostrar a senha"}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-control p-1.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </Hint>
        </div>
      </FormField>

      <div className="space-y-1">
        <label className="flex items-start gap-2.5 text-sm">
          <Checkbox
            id="signup-acceptTerms"
            className="mt-0.5"
            checked={values.acceptTerms}
            onCheckedChange={(checked) => set("acceptTerms", checked === true)}
            aria-invalid={errors.acceptTerms ? true : undefined}
          />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" target="_blank" className="underline">
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" target="_blank" className="underline">
              política de privacidade
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-destructive">{errors.acceptTerms}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        <Rocket aria-hidden="true" />
        {pending ? "Criando sua conta…" : "Começar o teste grátis"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
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
