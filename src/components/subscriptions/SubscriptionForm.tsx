"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Ban,
  Calculator,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  applyPlanAccessAction,
  saveSubscriptionAction,
  setSubscriptionCanceledAction,
} from "@/app/(admin)/subscription-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import {
  CYCLES,
  LAUNCH_OFFER,
  PLANS,
  suggestedPrice,
} from "@/components/subscriptions/subscription-catalog";
import {
  cancellationPreview,
  hasErrors,
  initialSubscriptionValues,
  launchOfferUntil,
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

          <section className="space-y-5">
            <div>
              <h2 className="font-semibold">Teste, pagamento e desconto</h2>
              <p className="text-sm text-muted-foreground">
                Com 5 dias de atraso no pagamento, a empresa passa a só
                consultar.
              </p>
            </div>
            <DateField
              id="subscription-trialEndsAt"
              label="Último dia do teste grátis"
              value={values.trialEndsAt}
              error={errors.trialEndsAt}
              onChange={(value) => set("trialEndsAt", value)}
            />

            {/* O "pago até" não se digita: muda sozinho a cada pagamento. */}
            <div className="space-y-1 text-sm">
              <p className="font-medium">Pagamento</p>
              <p className="text-muted-foreground">
                {values.paidUntil
                  ? `Paga até ${formatDateOnly(values.paidUntil)}.`
                  : "Nenhum pagamento registrado ainda."}{" "}
                Muda sozinho quando você registra um pagamento (botão de moedas
                na lista de assinaturas ou em Cobranças).
              </p>
            </div>

            <LaunchOfferField values={values} errors={errors} set={set} />

            {subscription && (
              <CancellationField
                companyId={companyId}
                companyName={companyName}
                subscription={subscription}
              />
            )}
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

// Hoje no fuso do navegador (o SUPER_ADMIN está no Brasil), "aaaa-mm-dd".
const todayIso = () => new Intl.DateTimeFormat("en-CA").format(new Date());

/**
 * Oferta de lançamento: uma chave que preenche o desconto e até quando ele
 * vale (os primeiros meses de pagamento). "Ajustar" mostra os dois campos
 * para outro combinado.
 */
function LaunchOfferField({
  values,
  errors,
  set,
}: {
  values: SubscriptionFormValues;
  errors: SubscriptionFormErrors;
  set: <K extends keyof SubscriptionFormValues>(
    key: K,
    value: SubscriptionFormValues[K],
  ) => void;
}) {
  const on = values.discountPercent.trim() !== "";
  // Desconto diferente da oferta padrão já abre os campos.
  const [adjusting, setAdjusting] = useState(
    on && values.discountPercent !== String(LAUNCH_OFFER.percent),
  );

  function toggle(checked: boolean) {
    if (checked) {
      set("discountPercent", String(LAUNCH_OFFER.percent));
      set(
        "discountUntil",
        launchOfferUntil(values, todayIso(), LAUNCH_OFFER.months),
      );
    } else {
      set("discountPercent", "");
      set("discountUntil", "");
      setAdjusting(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center justify-between gap-3 text-sm">
        <span>
          <span className="font-medium">Oferta de lançamento</span>
          <span className="block text-xs text-muted-foreground">
            {LAUNCH_OFFER.percent}% de desconto nos {LAUNCH_OFFER.months}{" "}
            primeiros meses de pagamento.
          </span>
        </span>
        <Switch
          checked={on}
          onCheckedChange={toggle}
          aria-label="Oferta de lançamento"
        />
      </label>
      {on && !adjusting && (
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          {values.discountPercent}% de desconto até{" "}
          {values.discountUntil ? formatDateOnly(values.discountUntil) : "--"}.
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAdjusting(true)}
          >
            <Pencil aria-hidden="true" />
            Ajustar
          </Button>
        </p>
      )}
      {on && adjusting && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="subscription-discountPercent"
            label="Desconto (%)"
            error={errors.discountPercent}
          >
            <Input
              id="subscription-discountPercent"
              inputMode="numeric"
              value={values.discountPercent}
              onChange={(event) => set("discountPercent", event.target.value)}
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
        </div>
      )}
    </div>
  );
}

/**
 * Cancelar a assinatura por botão: a data sai sozinha (a empresa usa até o
 * fim do que pagou e depois só consulta). Cancelada, mostra a data e
 * "Desfazer cancelamento". Só na alteração.
 */
function CancellationField({
  companyId,
  companyName,
  subscription,
}: {
  companyId: string;
  companyName: string;
  subscription: Subscription;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const canceled = subscription.canceledAt !== null;
  const preview = cancellationPreview(subscription, todayIso());

  function run(cancel: boolean) {
    startTransition(async () => {
      const result = await setSubscriptionCanceledAction(companyId, cancel);
      if (!result.ok) {
        toast.error(
          cancel
            ? "Não foi possível cancelar a assinatura."
            : "Não foi possível desfazer o cancelamento.",
          { description: result.message },
        );
        return;
      }
      toast.success(
        cancel ? "Assinatura cancelada." : "Cancelamento desfeito.",
        { description: companyName },
      );
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2 border-t border-border pt-4 text-sm">
      <p className="font-medium">Cancelamento</p>
      {canceled ? (
        <>
          <p className="text-muted-foreground">
            Assinatura cancelada. A empresa só consulta a partir de{" "}
            {formatDateOnly(subscription.canceledAt!)}.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => run(false)}
          >
            <RotateCcw aria-hidden="true" />
            {pending ? "Desfazendo…" : "Desfazer cancelamento"}
          </Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">
            A empresa usa até o fim do que já pagou e depois passa a só
            consultar. Os dados ficam guardados.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirming(true)}
          >
            <Ban aria-hidden="true" />
            Cancelar assinatura
          </Button>
        </>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Cancelar a assinatura?"
        description={
          preview.lastDay
            ? `${companyName} usa normalmente até ${formatDateOnly(preview.lastDay)} e, a partir de ${formatDateOnly(preview.from)}, passa a só consultar. Dá para desfazer depois.`
            : `${companyName} passa a só consultar a partir de hoje. Dá para desfazer depois.`
        }
        confirmLabel="Cancelar assinatura"
        pendingLabel="Cancelando…"
        cancelLabel="Voltar"
        pending={pending}
        destructive
        icon={Ban}
        onConfirm={() => run(true)}
      />
    </div>
  );
}
