"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FileSignature, X } from "lucide-react";
import { toast } from "sonner";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import { createClientPlanAction } from "@/app/(admin)/client-plan-actions";
import { ClientPlanSummary } from "@/components/client-plans/ClientPlanSummary";
import {
  ScheduleBlock,
  type ScheduleDraft,
} from "@/components/client-plans/ScheduleBlock";
import {
  addMonths,
  occurrences,
  WEEK_DAYS,
} from "@/components/recurrences/recurrence-schedule";
import { useClientSearch } from "@/components/recurrences/useClientSearch";
import { WeekDayHint } from "@/components/recurrences/WeekDayHint";
import { Combobox } from "@/components/shared/Combobox";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimeRange } from "@/types/agenda";
import type { WeekDay } from "@/types/business-hour";
import type { ClassGroupItem } from "@/types/class-group";
import type { BillingType } from "@/types/client-plan";
import type { PlanItem } from "@/types/plan";
import type { RecurrenceDay } from "@/types/recurrence";
import { formatDateOnly } from "@/utils/format";
import { minutesToTime, shiftDateString, timeToMinutes } from "@/utils/time";

type ServiceInfo = { duration: number; priceCents: number | null };

type ClientPlanFormProps = {
  clients: ClientOption[];
  /** Planos que podem ser contratados (ativos, com período e serviços ativos). */
  plans: PlanItem[];
  professionals: { id: string; name: string }[];
  /** Duração e preço avulso de cada serviço, pelo id. */
  services: Record<string, ServiceInfo>;
  /** Turmas ativas (vazia para quem não é ADMIN): cada serviço pode entrar numa. */
  classGroups: ClassGroupItem[];
  /** Hoje e agora no fuso da empresa. */
  today: string;
  nowMinutes: number;
};

type Errors = Partial<
  Record<"client" | "plan" | "months" | "billing" | "start" | "due", string>
> & {
  schedules?: Record<string, { professional?: string; days?: string }>;
};

const parseDay = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const EMPTY_SCHEDULE: ScheduleDraft = { professionalId: "", dayTimes: {} };

/**
 * Nova contratação: cliente e plano, condições (período, modalidade, datas e
 * valores) e a agenda de cada serviço do plano. Grava tudo de uma vez.
 */
export function ClientPlanForm({
  clients,
  plans,
  professionals,
  services,
  classGroups,
  today,
  nowMinutes,
}: ClientPlanFormProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [planId, setPlanId] = useState("");
  const [months, setMonths] = useState("");
  const [billingType, setBillingType] = useState<BillingType | "">("");
  const [startDate, setStartDate] = useState("");
  const [firstDueDate, setFirstDueDate] = useState("");
  const [schedules, setSchedules] = useState<Record<string, ScheduleDraft>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();
  const clientSearch = useClientSearch(clients, clientId);

  const plan = plans.find((item) => item.id === planId);
  const period = plan?.periods.find((item) => item.months === Number(months));
  // Fim = início + meses − 1 dia (ex.: 3 meses a partir de 15/10 → 14/01).
  const endDate =
    startDate && period
      ? shiftDateString(addMonths(startDate, period.months), -1)
      : "";

  // Dias completos (com horário) de um serviço e o fim de cada sessão.
  function daysOf(serviceId: string): RecurrenceDay[] {
    const duration = services[serviceId]?.duration ?? 0;
    const draft = schedules[serviceId] ?? EMPTY_SCHEDULE;
    return WEEK_DAYS.flatMap(({ id }) => {
      const start = draft.dayTimes[id];
      if (!start) return [];
      return [
        {
          weekDay: id,
          startTime: start,
          endTime: minutesToTime(
            Math.min(24 * 60, timeToMinutes(start) + duration),
          ),
        },
      ];
    });
  }

  // Sessões dos OUTROS serviços, por dia da semana: o cliente não pode estar em
  // dois atendimentos ao mesmo tempo.
  function extraBusyFor(serviceId: string) {
    const busy: Partial<Record<WeekDay, TimeRange[]>> = {};
    for (const other of plan?.services ?? []) {
      if (other.id === serviceId) continue;
      for (const day of daysOf(other.id)) {
        (busy[day.weekDay] ??= []).push({
          start: day.startTime,
          end: day.endTime,
        });
      }
    }
    return busy;
  }

  // Sessões do serviço no período (data e dia), em ordem.
  const sessionDatesOf = (serviceId: string) =>
    startDate && endDate
      ? occurrences(startDate, endDate, daysOf(serviceId), today, nowMinutes)
          .map((item) => item.date)
          .sort()
      : [];
  const sessionsOf = (serviceId: string) => sessionDatesOf(serviceId).length;

  // Comparativo com o avulso: só com todas as agendas completas.
  const complete =
    plan &&
    plan.services.every(
      (service) => daysOf(service.id).length === service.sessionsPerWeek,
    );
  const standalone =
    complete && endDate
      ? plan.services.reduce(
          (sum, service) => {
            const count = sessionsOf(service.id);
            return {
              sessions: sum.sessions + count,
              cents:
                sum.cents + count * (services[service.id]?.priceCents ?? 0),
            };
          },
          { sessions: 0, cents: 0 },
        )
      : undefined;

  function changePlan(next: string) {
    setPlanId(next);
    const chosen = plans.find((item) => item.id === next);
    // Plano com um único período: já vem escolhido.
    setMonths(
      chosen?.periods.length === 1 ? String(chosen.periods[0].months) : "",
    );
    setSchedules({});
    setErrors({});
  }

  // Cliente e período mudam os horários livres: os horários escolhidos saem
  // (os dias marcados e os profissionais continuam).
  function resetTimes() {
    setSchedules((current) =>
      Object.fromEntries(
        Object.entries(current).map(([serviceId, draft]) => [
          serviceId,
          // Na turma, os horários são os dela: não dependem do cliente nem do período.
          draft.classGroupId
            ? draft
            : {
                ...draft,
                dayTimes: Object.fromEntries(
                  Object.keys(draft.dayTimes).map((day) => [day, ""]),
                ),
              },
        ]),
      ),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const scheduleErrors: NonNullable<Errors["schedules"]> = {};
    for (const service of plan?.services ?? []) {
      const draft = schedules[service.id] ?? EMPTY_SCHEDULE;
      const marked = Object.keys(draft.dayTimes).length;
      const error: { professional?: string; days?: string } = {};
      if (!draft.professionalId)
        error.professional = "Selecione o profissional.";
      if (marked !== service.sessionsPerWeek) {
        error.days = `Escolha ${service.sessionsPerWeek} ${service.sessionsPerWeek === 1 ? "dia" : "dias"} da semana (o plano prevê ${service.sessionsPerWeek}× por semana).`;
      } else if (daysOf(service.id).length < marked) {
        error.days = "Escolha o horário de cada dia.";
      }
      if (error.professional || error.days) scheduleErrors[service.id] = error;
    }

    const found: Errors = {
      client: clientId ? undefined : "Selecione o cliente.",
      plan: planId ? undefined : "Selecione o plano.",
      months: !planId || period ? undefined : "Selecione o período.",
      billing: billingType ? undefined : "Selecione a modalidade.",
      start: startDate ? undefined : "Informe a data de início.",
      due:
        billingType === "MONTHLY" && !firstDueDate
          ? "Informe o primeiro vencimento (obrigatório no mensal)."
          : undefined,
      schedules:
        Object.keys(scheduleErrors).length > 0 ? scheduleErrors : undefined,
    };
    setErrors(found);

    const firstSchedule = Object.entries(scheduleErrors)[0];
    const firstInvalid = (
      [
        ["client", "client-plan-client"],
        ["plan", "client-plan-plan"],
        ["months", "client-plan-months"],
        ["billing", "client-plan-billing"],
        ["start", "client-plan-start"],
        ["due", "client-plan-due"],
      ] as const
    ).find(([field]) => found[field]);
    if (firstInvalid || firstSchedule || !plan || !period || !billingType) {
      const id = firstInvalid
        ? firstInvalid[1]
        : firstSchedule
          ? `schedule-${firstSchedule[0]}-${firstSchedule[1].professional ? "professional" : "days"}`
          : "";
      document.getElementById(id)?.focus();
      return;
    }

    startTransition(async () => {
      const result = await createClientPlanAction({
        clientId,
        planId,
        months: period.months,
        billingType,
        startDate,
        ...(firstDueDate && { firstDueDate }),
        schedules: plan.services.map((service) => ({
          serviceId: service.id,
          professionalId: schedules[service.id].professionalId,
          days: daysOf(service.id),
          classGroupId: schedules[service.id].classGroupId || undefined,
        })),
      });

      if (result.ok) {
        toast.success("Contratação realizada.", {
          description: `${plan.name} · ${period.months} meses`,
        });
        router.push(`/pacotes/contratacoes/${result.id}`);
        return;
      }
      toast.error("Não foi possível contratar o plano.", {
        description: result.message,
      });
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
      <div className="relative min-h-0 flex-1 space-y-8 overflow-auto p-4 md:p-6">
        <section className="space-y-4">
          <h2 className="font-semibold">Cliente e plano</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="client-plan-client"
              label="Cliente"
              required
              error={errors.client}
            >
              <Combobox
                id="client-plan-client"
                options={clientSearch.options.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={clientId}
                onValueChange={(next) => {
                  setClientId(next);
                  clientSearch.pick(next);
                  resetTimes();
                  setErrors((current) => ({ ...current, client: undefined }));
                }}
                placeholder="Selecione o cliente"
                searchPlaceholder="Buscar cliente…"
                emptyMessage="Nenhum cliente encontrado."
                loading={clientSearch.loading}
                onSearchChange={clientSearch.search}
              />
            </FormField>
            <FormField
              id="client-plan-plan"
              label="Plano"
              required
              error={errors.plan}
            >
              <Select value={planId || undefined} onValueChange={changePlan}>
                <SelectTrigger id="client-plan-plan" className="w-full">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          {plan && (
            <p className="text-sm text-muted-foreground">
              Serviços:{" "}
              {plan.services
                .map(
                  (service) =>
                    `${service.name} ${service.sessionsPerWeek}×/sem`,
                )
                .join(", ")}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold">Condições</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FormField
              id="client-plan-months"
              label="Período"
              required
              error={errors.months}
            >
              <Select
                value={months || undefined}
                disabled={!plan}
                onValueChange={(next) => {
                  setMonths(next);
                  resetTimes();
                  setErrors((current) => ({ ...current, months: undefined }));
                }}
              >
                <SelectTrigger id="client-plan-months" className="w-full">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {plan?.periods.map((item) => (
                    <SelectItem key={item.months} value={String(item.months)}>
                      {item.months} {item.months === 1 ? "mês" : "meses"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              id="client-plan-billing"
              label="Modalidade"
              required
              error={errors.billing}
            >
              <Select
                value={billingType || undefined}
                onValueChange={(next) => {
                  setBillingType(next as BillingType);
                  setErrors((current) => ({ ...current, billing: undefined }));
                }}
              >
                <SelectTrigger id="client-plan-billing" className="w-full">
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTEGRAL">
                    Integral (pagamento único)
                  </SelectItem>
                  <SelectItem value="MONTHLY">
                    Mensal (uma parcela por mês)
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              id="client-plan-start"
              label="Data de início"
              required
              error={errors.start}
            >
              <DatePicker
                id="client-plan-start"
                name="startDate"
                minDate={parseDay(today)}
                onValueChange={(next) => {
                  setStartDate(next);
                  resetTimes();
                  setErrors((current) => ({ ...current, start: undefined }));
                }}
              />
              {startDate && <WeekDayHint date={startDate} />}
            </FormField>
            <FormField
              id="client-plan-due"
              label={
                billingType === "INTEGRAL"
                  ? "Vencimento (opcional)"
                  : "Primeiro vencimento"
              }
              required={billingType === "MONTHLY"}
              error={errors.due}
            >
              <DatePicker
                id="client-plan-due"
                name="firstDueDate"
                minDate={parseDay(today)}
                onValueChange={(next) => {
                  setFirstDueDate(next);
                  setErrors((current) => ({ ...current, due: undefined }));
                }}
              />
            </FormField>
          </div>

          {endDate && (
            <p className="text-sm text-muted-foreground tabular-nums">
              Período da contratação: {formatDateOnly(startDate)} a{" "}
              {formatDateOnly(endDate)}
              {billingType === "MONTHLY" &&
                " · as parcelas seguintes vencem no mesmo dia dos meses seguintes"}
              .
            </p>
          )}

          {plan && period && (
            <ClientPlanSummary
              monthlyPrice={plan.monthlyPrice}
              period={period}
              billingType={billingType}
              standalone={standalone}
            />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-semibold">Agenda dos serviços</h2>
            <p className="text-sm text-muted-foreground">
              Para cada serviço, o profissional e os dias da semana. Só aparecem
              horários livres em todas as datas do período.
            </p>
          </div>
          {plan ? (
            plan.services.map((service) => (
              <ScheduleBlock
                key={service.id}
                service={{
                  id: service.id,
                  name: service.name,
                  duration: services[service.id]?.duration ?? 0,
                  sessionsPerWeek: service.sessionsPerWeek,
                }}
                professionals={professionals}
                classGroups={classGroups.filter(
                  (group) => group.serviceId === service.id,
                )}
                value={schedules[service.id] ?? EMPTY_SCHEDULE}
                onChange={(next) => {
                  setSchedules((current) => ({
                    ...current,
                    [service.id]: next,
                  }));
                  setErrors((current) => ({
                    ...current,
                    schedules: current.schedules && {
                      ...current.schedules,
                      [service.id]: {},
                    },
                  }));
                }}
                clientId={clientId}
                startDate={startDate}
                endDate={endDate}
                extraBusy={extraBusyFor(service.id)}
                sessions={sessionsOf(service.id)}
                firstSession={sessionDatesOf(service.id)[0]}
                error={errors.schedules?.[service.id]}
              />
            ))
          ) : (
            <p className="rounded-control border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              Selecione o plano para montar a agenda dos serviços.
            </p>
          )}
        </section>
      </div>

      <FormFooter
        note={
          <>
            <span className="text-destructive">*</span> Campos obrigatórios
          </>
        }
      >
        <Button asChild variant="outline">
          <Link href="/pacotes/contratacoes">
            <X aria-hidden="true" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={pending}>
          <FileSignature aria-hidden="true" />
          {pending ? "Contratando…" : "Contratar"}
        </Button>
      </FormFooter>
    </form>
  );
}
