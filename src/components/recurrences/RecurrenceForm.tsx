"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import { createRecurrenceAction } from "@/app/(admin)/recurrence-actions";
import {
  RecurrenceDaysField,
  type DayTimes,
} from "@/components/recurrences/RecurrenceDaysField";
import {
  addMonths,
  MAX_RECURRENCE_MONTHS,
  occurrences,
  shortDayLabel,
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
import { Textarea } from "@/components/ui/textarea";
import type { RecurrenceDay } from "@/types/recurrence";
import { formatDateOnly, formatDuration } from "@/utils/format";
import { minutesToTime, timeToMinutes } from "@/utils/time";

type RecurrenceFormProps = {
  clients: ClientOption[];
  professionals: { id: string; name: string }[];
  /** Serviços ativos com preço (a API exige preço para gerar as cobranças). */
  services: {
    id: string;
    name: string;
    duration: number;
    color: string | null;
  }[];
  /** Hoje e agora no fuso da empresa: o que já passou não gera sessão. */
  today: string;
  nowMinutes: number;
};

type Errors = Partial<
  Record<
    "client" | "service" | "professional" | "start" | "end" | "days",
    string
  >
>;

// "aaaa-mm-dd" → Date local (o calendário compara no relógio do navegador).
const parseDay = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Cadastro de recorrência: quem, o quê, por quanto tempo e em quais dias. */
export function RecurrenceForm({
  clients,
  professionals,
  services,
  today,
  nowMinutes,
}: RecurrenceFormProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dayTimes, setDayTimes] = useState<DayTimes>({});
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();
  const clientSearch = useClientSearch(clients, clientId);

  const service = services.find((item) => item.id === serviceId);
  const maxEnd = startDate ? addMonths(startDate, MAX_RECURRENCE_MONTHS) : "";

  // Dias completos (com horário) e o horário final de cada um (início + duração).
  const days: RecurrenceDay[] = service
    ? WEEK_DAYS.flatMap(({ id }) => {
        const start = dayTimes[id];
        if (!start) return [];
        return [
          {
            weekDay: id,
            startTime: start,
            endTime: minutesToTime(
              Math.min(24 * 60, timeToMinutes(start) + service.duration),
            ),
          },
        ];
      })
    : [];

  const sessions =
    startDate && endDate
      ? occurrences(startDate, endDate, days, today, nowMinutes)
      : [];

  // Cliente, profissional, serviço e período mudam os horários livres: os horários
  // já escolhidos deixam de valer (os dias marcados continuam).
  function resetTimes() {
    setDayTimes((current) =>
      Object.fromEntries(Object.keys(current).map((day) => [day, ""])),
    );
  }

  function clear(field: keyof Errors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const checked = Object.keys(dayTimes);
    const found: Errors = {
      client: clientId ? undefined : "Selecione o cliente.",
      service: serviceId ? undefined : "Selecione o serviço.",
      professional: professionalId ? undefined : "Selecione o profissional.",
      start: startDate ? undefined : "Informe a data inicial.",
      end: !endDate
        ? "Informe a data final."
        : endDate < startDate
          ? "A data final não pode ser anterior à inicial."
          : endDate > maxEnd
            ? `O período máximo é de ${MAX_RECURRENCE_MONTHS} meses.`
            : undefined,
      days:
        checked.length === 0
          ? "Escolha ao menos um dia da semana."
          : days.length < checked.length
            ? "Informe o horário de cada dia escolhido."
            : sessions.length === 0
              ? "Nenhuma sessão cabe neste período."
              : undefined,
    };
    setErrors(found);
    const firstInvalid = (
      [
        ["client", "recurrence-client"],
        ["service", "recurrence-service"],
        ["professional", "recurrence-professional"],
        ["start", "recurrence-start"],
        ["end", "recurrence-end"],
        ["days", "recurrence-days"],
      ] as const
    ).find(([field]) => found[field]);
    if (firstInvalid || !service) {
      document.getElementById(firstInvalid?.[1] ?? "")?.focus();
      return;
    }

    startTransition(async () => {
      const result = await createRecurrenceAction({
        clientId,
        professionalId,
        serviceId,
        startDate,
        endDate,
        note: note.trim() || undefined,
        days,
      });

      if (result.ok) {
        toast.success("Recorrência cadastrada.", {
          description: `${sessions.length} sessões agendadas.`,
        });
        router.push("/recorrencias");
        return;
      }
      toast.error("Não foi possível cadastrar a recorrência.", {
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
      <div className="relative min-h-0 flex-1 space-y-4 overflow-auto p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            id="recurrence-client"
            label="Cliente"
            required
            error={errors.client}
          >
            <Combobox
              id="recurrence-client"
              options={clientSearch.options.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              value={clientId}
              onValueChange={(next) => {
                setClientId(next);
                clientSearch.pick(next);
                resetTimes();
                clear("client");
              }}
              placeholder="Selecione o cliente..."
              searchPlaceholder="Buscar cliente…"
              emptyMessage="Nenhum cliente encontrado."
              loading={clientSearch.loading}
              onSearchChange={clientSearch.search}
            />
          </FormField>

          <FormField
            id="recurrence-service"
            label="Serviço"
            required
            error={errors.service}
          >
            <Combobox
              id="recurrence-service"
              options={services.map((item) => ({
                value: item.id,
                label: `${item.name} · ${formatDuration(item.duration)}`,
              }))}
              value={serviceId}
              onValueChange={(next) => {
                setServiceId(next);
                resetTimes();
                clear("service");
              }}
              placeholder="Selecione o serviço..."
              searchPlaceholder="Buscar serviço…"
              emptyMessage="Nenhum serviço encontrado."
            />
          </FormField>

          <FormField
            id="recurrence-professional"
            label="Profissional"
            required
            error={errors.professional}
          >
            <Select
              value={professionalId || undefined}
              onValueChange={(next) => {
                setProfessionalId(next);
                resetTimes();
                clear("professional");
              }}
            >
              <SelectTrigger id="recurrence-professional" className="w-full">
                <SelectValue placeholder="Selecione o profissional..." />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="recurrence-start"
              label="Data inicial"
              required
              error={errors.start}
            >
              <DatePicker
                id="recurrence-start"
                name="startDate"
                initialValue={undefined}
                minDate={parseDay(today)}
                onValueChange={(next) => {
                  setStartDate(next);
                  resetTimes();
                  clear("start");
                }}
              />
              {startDate && <WeekDayHint date={startDate} />}
            </FormField>
            <FormField
              id="recurrence-end"
              label="Data final"
              required
              error={errors.end}
            >
              <DatePicker
                id="recurrence-end"
                name="endDate"
                initialValue={endDate || undefined}
                minDate={parseDay(startDate || today)}
                maxDate={maxEnd ? parseDay(maxEnd) : undefined}
                onValueChange={(next) => {
                  setEndDate(next);
                  resetTimes();
                  clear("end");
                }}
              />
            </FormField>
          </div>
        </div>

        <FormField
          id="recurrence-days"
          label="Dias da semana"
          required
          error={errors.days}
        >
          <RecurrenceDaysField
            value={dayTimes}
            onChange={(next) => {
              setDayTimes(next);
              clear("days");
            }}
            id="recurrence-days"
            invalid={Boolean(errors.days)}
            clientId={clientId}
            professionalId={professionalId}
            duration={service?.duration ?? 0}
            startDate={startDate}
            endDate={endDate}
          />
        </FormField>

        {service && days.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Cada sessão dura {formatDuration(service.duration)}; o término é o
            início mais a duração do serviço.
          </p>
        )}

        <FormField id="recurrence-note" label="Observações">
          <Textarea
            id="recurrence-note"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Preferências, cuidados, informações úteis para os atendimentos..."
          />
        </FormField>
      </div>

      <FormFooter
        note={
          sessions.length > 0
            ? sessions.length === 1
              ? `1 sessão, em ${shortDayLabel(sessions[0].date)}`
              : `${sessions.length} sessões, a primeira em ${shortDayLabel(sessions[0].date)} e a última em ${formatDateOnly(sessions[sessions.length - 1].date)}`
            : "Campos marcados com * são obrigatórios."
        }
      >
        <Button asChild variant="outline" disabled={pending}>
          <Link href="/recorrencias">
            <X aria-hidden="true" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending ? "Cadastrando…" : "Cadastrar"}
        </Button>
      </FormFooter>
    </form>
  );
}
