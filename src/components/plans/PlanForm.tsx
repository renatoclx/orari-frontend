"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Calculator, Plus, Save, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { createPlanAction, updatePlanAction } from "@/app/(admin)/plan-actions";
import {
  suggestedMonthlyCents,
  toCents,
  WEEKS_PER_MONTH,
} from "@/components/plans/plan-pricing";
import {
  hasErrors,
  validatePlanForm,
  type PeriodDraft,
  type PlanFormErrors,
  type PlanFormValues,
} from "@/components/plans/plan-validation";
import { PlanPeriodsField } from "@/components/plans/PlanPeriodsField";
import {
  ServicesPicker,
  type ServiceOption,
} from "@/components/plans/ServicesPicker";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PlanItem } from "@/types/plan";
import { formatPrice } from "@/utils/format";
import { maskCurrency } from "@/utils/masks";

const BASE_PATH = "/pacotes/planos";

type PlanFormProps = {
  /** Serviços da empresa (ativos e inativos), com o preço avulso. */
  services: (ServiceOption & { isActive: boolean })[];
  /** Presente na alteração; sem isso, é o cadastro. */
  plan?: PlanItem;
};

// "12" (texto da API) → "12"; "12.5" → "12,5" (o campo aceita vírgula).
const percentText = (value: string) => String(Number(value)).replace(".", ",");

function initialValues(plan?: PlanItem): PlanFormValues {
  return {
    name: plan?.name ?? "",
    description: plan?.description ?? "",
    monthlyPrice: plan ? String(toCents(plan.monthlyPrice)) : "",
    services:
      plan?.services.map((service) => ({
        serviceId: service.id,
        sessionsPerWeek: service.sessionsPerWeek,
      })) ?? [],
    periods:
      plan?.periods.map((period): PeriodDraft => ({
        key: String(period.months),
        months: String(period.months),
        discountPercent: percentText(period.discountPercent),
        monthlyDiscountPercent: percentText(period.monthlyDiscountPercent),
      })) ?? [],
  };
}

/**
 * Cadastro e alteração de plano (página): dados, serviços e períodos de
 * contratação com a prévia dos valores.
 */
export function PlanForm({ services, plan }: PlanFormProps) {
  const router = useRouter();
  const editing = plan !== undefined;
  const [values, setValues] = useState(() => initialValues(plan));
  const [errors, setErrors] = useState<PlanFormErrors>({});
  const [pending, startTransition] = useTransition();
  const nextKey = useRef(1);

  // Serviços do plano inativados depois: aparecem marcados e precisam sair.
  const inactive = services.filter(
    (service) =>
      !service.isActive &&
      plan?.services.some((item) => item.id === service.id),
  );
  const inactiveIds = inactive.map((service) => service.id);
  const active = services.filter((service) => service.isActive);

  // Valor sugerido: preço avulso × atendimentos por semana × 4 semanas.
  const chosen = values.services.map((item) => ({
    ...item,
    priceCents:
      services.find((service) => service.id === item.serviceId)?.priceCents ??
      null,
  }));
  const suggestedCents = suggestedMonthlyCents(chosen);
  const belowSuggested =
    Boolean(values.monthlyPrice) &&
    suggestedCents > 0 &&
    Number(values.monthlyPrice) < suggestedCents;

  function set<K extends keyof PlanFormValues>(
    key: K,
    value: PlanFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validatePlanForm(values, inactiveIds);
    setErrors(found);
    if (hasErrors(found)) {
      const first = found.name
        ? "plan-name"
        : found.monthlyPrice
          ? "plan-price"
          : found.services
            ? "plan-services"
            : `period-${Object.keys(found.periods ?? {})[0]}-months`;
      document.getElementById(first)?.focus();
      return;
    }

    startTransition(async () => {
      const result = plan
        ? await updatePlanAction(plan.id, values)
        : await createPlanAction(values);

      if (result.ok) {
        toast.success(editing ? "Plano atualizado." : "Plano cadastrado.", {
          description: values.name.trim(),
        });
        router.push(BASE_PATH);
        return;
      }
      if (result.field === "name") {
        setErrors({ name: result.message });
        document.getElementById("plan-name")?.focus();
      }
      toast.error(
        editing
          ? "Não foi possível atualizar o plano."
          : "Não foi possível cadastrar o plano.",
        { description: result.message },
      );
    });
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      {/* relative: os inputs escondidos do Radix (Switch e Select num form) são
          absolutos; presos aqui, não aumentam a altura da página. */}
      <div className="relative min-h-0 flex-1 overflow-auto p-4 md:p-6">
        <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
          <section className="space-y-4">
            <h2 className="font-semibold">Dados do plano</h2>
            <FormField id="plan-name" label="Nome" required error={errors.name}>
              <Input
                id="plan-name"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                autoComplete="off"
                placeholder="Ex.: Pilates + Quiropraxia"
                aria-invalid={errors.name ? true : undefined}
              />
            </FormField>
            <FormField
              id="plan-services"
              label="Serviços"
              required
              error={errors.services}
            >
              <ServicesPicker
                id="plan-services"
                options={active}
                inactive={inactive}
                value={values.services}
                onChange={(next) => set("services", next)}
                invalid={Boolean(errors.services)}
              />
            </FormField>
            {chosen.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-muted px-3 py-2 text-sm">
                <p className="tabular-nums">
                  Valor sugerido:{" "}
                  <strong>{formatPrice(suggestedCents / 100)}</strong> por mês
                  <span className="block text-xs text-muted-foreground">
                    Preço avulso × atendimentos por semana × {WEEKS_PER_MONTH}{" "}
                    semanas
                    {chosen.some((item) => item.priceCents === null) &&
                      "; serviço sem preço conta como R$ 0,00"}
                    .
                  </span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    suggestedCents === 0 ||
                    Number(values.monthlyPrice) === suggestedCents
                  }
                  onClick={() => set("monthlyPrice", String(suggestedCents))}
                >
                  <Calculator aria-hidden="true" />
                  Usar valor sugerido
                </Button>
              </div>
            )}
            <FormField
              id="plan-price"
              label="Valor mensal"
              required
              error={errors.monthlyPrice}
            >
              <MaskedInput
                id="plan-price"
                mask={maskCurrency}
                value={values.monthlyPrice}
                onValueChange={(digits) => set("monthlyPrice", digits)}
                inputMode="numeric"
                placeholder="R$ 0,00"
                aria-invalid={errors.monthlyPrice ? true : undefined}
              />
            </FormField>
            {/* Só avisa: a empresa pode querer um valor promocional. */}
            {belowSuggested && (
              <p
                role="status"
                className="flex items-start gap-2 rounded-control border border-border bg-muted px-3 py-2 text-sm"
              >
                <TriangleAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                O valor mensal é menor que o valor avulso dos atendimentos do
                mês ({formatPrice(suggestedCents / 100)}).
              </p>
            )}
            <FormField id="plan-description" label="Descrição">
              <Textarea
                id="plan-description"
                rows={4}
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                placeholder="O que o pacote oferece"
              />
            </FormField>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">Períodos de contratação</h2>
              <p className="text-sm text-muted-foreground">
                Para cada período, o desconto no pagamento integral e no mensal.
              </p>
            </div>
            <PlanPeriodsField
              value={values.periods}
              onChange={(periods) => set("periods", periods)}
              errors={errors.periods}
              monthlyCents={Number(values.monthlyPrice) || 0}
              newKey={() => `new-${nextKey.current++}`}
            />
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
        <Button type="submit" disabled={pending}>
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
    </form>
  );
}
