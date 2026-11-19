"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Calculator, Plus, Save, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import {
  applyPlanAccessAction,
  saveSubscriptionAction,
} from "@/app/(admin)/subscription-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import {
  CYCLES,
  PLANS,
  suggestedPrice,
} from "@/components/subscriptions/subscription-catalog";
import {
  hasErrors,
  initialSubscriptionValues,
  validateSubscriptionForm,
  type SubscriptionFormErrors,
  type SubscriptionFormValues,
} from "@/components/subscriptions/subscription-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  BillingCycle,
  Subscription,
  SubscriptionPlan,
} from "@/types/subscription";
import { formatDateOnly, formatPrice } from "@/utils/format";
import { maskCurrency } from "@/utils/masks";

const BASE_PATH = "/assinaturas";
// O calendário navega a partir daqui (as datas da assinatura são deste ano em diante).
const CALENDAR_START = new Date(2026, 0, 1);

type SubscriptionFormProps = {
  companyId: string;
  companyName: string;
  /** Nula: a empresa ainda não tem assinatura (cadastro). */
  subscription: Subscription | null;
};

// Valor sugerido em centavos, para o campo com máscara.
function suggestedCents(values: {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  extraProfessionals: string;
  anamnesisAddon: boolean;
}): number {
  return Math.round(
    suggestedPrice({
      plan: values.plan,
      cycle: values.cycle,
      extraProfessionals: Number(values.extraProfessionals) || 0,
      anamnesisAddon: values.anamnesisAddon,
    }) * 100,
  );
}

/**
 * Cadastro e alteração da assinatura (página). Ao salvar com plano, extras ou
 * anamnese diferentes, oferece aplicar os acessos e limites do plano.
 */
export function SubscriptionForm({
  companyId,
  companyName,
  subscription,
}: SubscriptionFormProps) {
  const router = useRouter();
  const editing = subscription !== null;
  const [values, setValues] = useState(() =>
    initialSubscriptionValues(subscription, (plan, cycle) =>
      suggestedCents({
        plan,
        cycle,
        extraProfessionals: "0",
        anamnesisAddon: false,
      }),
    ),
  );
  const [errors, setErrors] = useState<SubscriptionFormErrors>({});
  const [pending, startTransition] = useTransition();
  const [askApply, setAskApply] = useState(false);
  const [applying, startApply] = useTransition();

  const suggested = suggestedCents(values);
  // O Clinical já inclui a anamnese: o adicional fica desligado e travado.
  const clinical = values.plan === "CLINICAL";

  function set<K extends keyof SubscriptionFormValues>(
    key: K,
    value: SubscriptionFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  // O que muda os acessos: o plano, os extras (limite) e a anamnese (matriz).
  const accessChanged =
    !subscription ||
    subscription.plan !== values.plan ||
    String(subscription.extraProfessionals) !==
      values.extraProfessionals.trim() ||
    subscription.anamnesisAddon !== values.anamnesisAddon;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateSubscriptionForm(values);
    setErrors(found);
    if (hasErrors(found)) {
      const first = Object.keys(found)[0];
      document.getElementById(`subscription-${first}`)?.focus();
      return;
    }

    startTransition(async () => {
      const result = await saveSubscriptionAction(companyId, values);
      if (!result.ok) {
        toast.error("Não foi possível salvar a assinatura.", {
          description: result.message,
        });
        return;
      }
      toast.success(editing ? "Assinatura atualizada." : "Assinatura criada.", {
        description: companyName,
      });
      if (accessChanged) {
        setAskApply(true);
        return;
      }
      router.push(BASE_PATH);
    });
  }

  function applyAccess() {
    startApply(async () => {
      const result = await applyPlanAccessAction(
        companyId,
        values.plan,
        Number(values.extraProfessionals),
        values.anamnesisAddon,
      );
      if (!result.ok) {
        toast.error("Não foi possível aplicar os acessos do plano.", {
          description: result.message,
        });
        return;
      }
      toast.success("Acessos e limites do plano aplicados.", {
        description: companyName,
      });
      router.push(BASE_PATH);
    });
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      {/* relative: os inputs escondidos do Radix (Switch e Select num form)
          ficam presos aqui e não aumentam a altura da página. */}
      <div className="relative min-h-0 flex-1 overflow-auto p-4 md:p-6">
        {subscription && (
          <p className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            Situação atual:
            <SubscriptionStatusBadge status={subscription.status} />
            {subscription.endsAt &&
              `até ${formatDateOnly(subscription.endsAt)}`}
          </p>
        )}
        <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
          <section className="space-y-4">
            <h2 className="font-semibold">Plano e valor</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="subscription-plan" label="Plano" required>
                <Select
                  value={values.plan}
                  onValueChange={(plan) => {
                    set("plan", plan as SubscriptionPlan);
                    // O Clinical já inclui a anamnese: o adicional não se aplica.
                    if (plan === "CLINICAL") set("anamnesisAddon", false);
                  }}
                >
                  <SelectTrigger id="subscription-plan" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map((plan) => (
                      <SelectItem key={plan.key} value={plan.key}>
                        {plan.label} ({formatPrice(plan.monthly)}/mês)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="subscription-cycle" label="Cobrança" required>
                <Select
                  value={values.cycle}
                  onValueChange={(cycle) => set("cycle", cycle as BillingCycle)}
                >
                  <SelectTrigger id="subscription-cycle" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLES.map((cycle) => (
                      <SelectItem key={cycle.key} value={cycle.key}>
                        {cycle.label}
                        {cycle.discount > 0 &&
                          ` (−${Math.round(cycle.discount * 100)}%)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField
              id="subscription-extraProfessionals"
              label="Profissionais extras"
              error={errors.extraProfessionals}
            >
              <Input
                id="subscription-extraProfessionals"
                inputMode="numeric"
                value={values.extraProfessionals}
                onChange={(event) =>
                  set("extraProfessionals", event.target.value)
                }
                aria-invalid={errors.extraProfessionals ? true : undefined}
              />
            </FormField>
            <label
              className={`flex items-center justify-between gap-3 text-sm ${
                clinical ? "text-muted-foreground" : ""
              }`}
            >
              <span>
                Adicional de anamnese
                <span className="block text-xs text-muted-foreground">
                  {clinical
                    ? "Já incluída no Clinical."
                    : "Fichas, modelos de ficha e auditoria, sem turmas."}
                </span>
              </span>
              <Switch
                checked={values.anamnesisAddon}
                disabled={clinical}
                onCheckedChange={(checked) => set("anamnesisAddon", checked)}
                aria-label="Adicional de anamnese"
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-muted px-3 py-2 text-sm">
              <p className="tabular-nums">
                Valor sugerido: <strong>{formatPrice(suggested / 100)}</strong>{" "}
                por cobrança
                <span className="block text-xs text-muted-foreground">
                  Calculado com os preços do site. No semestral e no anual, já
                  com o desconto.
                </span>
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={Number(values.priceCents) === suggested}
                onClick={() => set("priceCents", String(suggested))}
              >
                <Calculator aria-hidden="true" />
                Usar valor sugerido
              </Button>
            </div>
            <FormField
              id="subscription-priceCents"
              label="Valor cobrado"
              required
              error={errors.priceCents}
            >
              <MaskedInput
                id="subscription-priceCents"
                mask={maskCurrency}
                value={values.priceCents}
                onValueChange={(digits) => set("priceCents", digits)}
                inputMode="numeric"
                placeholder="R$ 0,00"
                aria-invalid={errors.priceCents ? true : undefined}
              />
            </FormField>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">Datas</h2>
              <p className="text-sm text-muted-foreground">
                O Orari usa estas datas para saber se a empresa está em teste,
                em dia ou atrasada. Com 5 dias de atraso, ela passa a só
                consultar.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DateField
                id="subscription-trialEndsAt"
                label="Fim do teste"
                value={values.trialEndsAt}
                onChange={(value) => set("trialEndsAt", value)}
              />
              <DateField
                id="subscription-paidUntil"
                label="Pago até o dia"
                value={values.paidUntil}
                error={errors.paidUntil}
                onChange={(value) => set("paidUntil", value)}
              />
              <FormField
                id="subscription-discountPercent"
                label="Desconto (%)"
                error={errors.discountPercent}
              >
                <Input
                  id="subscription-discountPercent"
                  inputMode="numeric"
                  placeholder="Ex.: 50"
                  value={values.discountPercent}
                  onChange={(event) =>
                    set("discountPercent", event.target.value)
                  }
                  aria-invalid={errors.discountPercent ? true : undefined}
                />
              </FormField>
              <DateField
                id="subscription-discountUntil"
                label="Desconto vale até"
                value={values.discountUntil}
                error={errors.discountUntil}
                onChange={(value) => set("discountUntil", value)}
              />
              <DateField
                id="subscription-canceledAt"
                label="Cancelar a partir de"
                value={values.canceledAt}
                onChange={(value) => set("canceledAt", value)}
              />
            </div>
          </section>
        </div>
      </div>

      <FormFooter
        note={
          <>
            <span className="text-destructive">*</span> Campos obrigatórios
          </>
        }
      >
        <Button asChild variant="outline">
          <Link href={BASE_PATH}>
            <X aria-hidden="true" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={pending || askApply}>
          {editing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {editing
            ? pending
              ? "Salvando…"
              : "Salvar alterações"
            : pending
              ? "Cadastrando…"
              : "Cadastrar"}
        </Button>
      </FormFooter>

      <ConfirmDialog
        open={askApply}
        // Fechar sem aplicar: a assinatura já está salva; volta à lista.
        onOpenChange={(open) => {
          if (!open && !applying) router.push(BASE_PATH);
        }}
        title="Aplicar os acessos do plano?"
        description={`${companyName} passa a ter o que o plano inclui (telas e número de profissionais). Ajustes feitos à mão para essa empresa serão desfeitos.`}
        confirmLabel="Aplicar"
        pendingLabel="Aplicando…"
        cancelLabel="Agora não"
        pending={applying}
        icon={SlidersHorizontal}
        onConfirm={applyAccess}
      />
    </form>
  );
}

/** Data opcional: calendário e um botão para limpar (o DatePicker não limpa). */
function DateField({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  // Trocar a chave remonta o DatePicker vazio depois de limpar.
  const [version, setVersion] = useState(0);
  return (
    <FormField id={id} label={label} error={error}>
      <div className="flex gap-2">
        {/* min-w-0: o campo encolhe para o botão de limpar caber ao lado. */}
        <div className="min-w-0 flex-1">
          <DatePicker
            key={version}
            id={id}
            name={id}
            minDate={CALENDAR_START}
            initialValue={value || null}
            onValueChange={onChange}
          />
        </div>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label={`Limpar ${label.toLowerCase()}`}
            onClick={() => {
              onChange("");
              setVersion((current) => current + 1);
            }}
          >
            <X aria-hidden="true" />
          </Button>
        )}
      </div>
    </FormField>
  );
}
