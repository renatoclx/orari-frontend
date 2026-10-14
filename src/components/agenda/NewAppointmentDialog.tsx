"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/shared/FormField";
import { Combobox } from "@/components/shared/Combobox";
import { DatePicker } from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AgendaAppointment,
  AgendaProfessional,
  TimeRange,
} from "@/types/agenda";
import { formatDuration } from "@/utils/format";
import {
  expedientOf,
  isOutsideExpedient,
} from "@/components/agenda/agenda-range";
import { minutesToTime, timeToMinutes } from "@/utils/time";

/** Serviço como o formulário o oferece. */
export type AgendaServiceOption = {
  id: string;
  name: string;
  /** Em minutos. */
  duration: number;
};

/** Cliente como o formulário o oferece. */
export type AgendaClientOption = { id: string; name: string };

type NewAppointmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionals: AgendaProfessional[];
  services: AgendaServiceOption[];
  clients: AgendaClientOption[];
  /** Dia da agenda, "aaaa-mm-dd". */
  date: string;
  /** Profissional e horário do intervalo clicado (nulos no botão geral). */
  initial: {
    professionalId: string | null;
    time: string | null;
    /** Encaixe: agendamento fora do horário de funcionamento. */
    overbooking: boolean;
  };
  /** Janelas de funcionamento do dia, para o encaixe saber o que é "fora". */
  businessHours: TimeRange[];
  /** Agendamentos do dia, para o encaixe não sobrepor nenhum. */
  appointments: AgendaAppointment[];
  /** Minutos do dia que já passaram (encaixe não acontece no passado). */
  pastMinutes: number;
};

const SLOT_MINUTES = 30;
const DAY_MINUTES = 24 * 60;

/**
 * Horários de início possíveis para um encaixe: de 30 em 30 minutos, fora do
 * expediente (antes da abertura ou depois do fechamento), que ainda não passaram e que não sobrepõem um agendamento do
 * profissional. Considera a duração do serviço escolhido (30 min sem serviço).
 */
function overbookingTimes({
  professionalId,
  durationMinutes,
  businessHours,
  appointments,
  pastMinutes,
}: {
  professionalId: string | null;
  durationMinutes: number;
  businessHours: TimeRange[];
  appointments: AgendaAppointment[];
  pastMinutes: number;
}): string[] {
  if (!professionalId) return [];

  const expedient = expedientOf(businessHours);
  const busy = appointments
    .filter(
      (appointment) =>
        appointment.professionalId === professionalId &&
        appointment.status !== "CANCELLED",
    )
    .map((appointment) => ({
      start: timeToMinutes(appointment.start),
      end: timeToMinutes(appointment.end),
    }));

  const times: string[] = [];
  for (
    let start = 0;
    start + durationMinutes <= DAY_MINUTES;
    start += SLOT_MINUTES
  ) {
    const end = start + durationMinutes;
    const overlaps = (range: { start: number; end: number }) =>
      range.start < end && range.end > start;

    if (start < pastMinutes) continue;
    if (!isOutsideExpedient(start, end, expedient)) continue;
    if (busy.some(overlaps)) continue;
    times.push(minutesToTime(start));
  }
  return times;
}

// RASCUNHO VISUAL: mostra como o cadastro de agendamento seria. Ainda não grava
// nada; a especificação (campos, regras, confirmação) vem do screens.md.
export function NewAppointmentDialog(props: NewAppointmentDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <NewAppointmentForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function NewAppointmentForm({
  onOpenChange,
  professionals,
  services,
  clients,
  date,
  initial,
  businessHours,
  appointments,
  pastMinutes,
}: NewAppointmentDialogProps) {
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState(
    initial.professionalId ?? "",
  );
  const [time, setTime] = useState(initial.time ?? "");
  const overbooking = initial.overbooking;

  const service = services.find((item) => item.id === serviceId);
  const overbookingOptions = overbooking
    ? overbookingTimes({
        professionalId: professionalId || null,
        durationMinutes: service?.duration ?? SLOT_MINUTES,
        businessHours,
        appointments,
        pastMinutes,
      })
    : [];
  // Término previsto: o início mais a duração do serviço.
  const endsAt =
    service && time
      ? minutesToTime(Math.min(24 * 60, timeToMinutes(time) + service.duration))
      : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.info("Rascunho de tela: o agendamento ainda não é gravado.");
    onOpenChange(false);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {overbooking ? "Encaixar horário" : "Novo agendamento"}
        </DialogTitle>
        <DialogDescription>
          Escolha o cliente, o serviço e o horário do atendimento.
        </DialogDescription>
      </DialogHeader>

      {overbooking && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-control border border-border bg-muted px-3 py-2 text-sm"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p>
            Você está agendando{" "}
            <strong>fora do horário de funcionamento</strong>. Só aparecem
            horários livres, fora do expediente, que ainda não passaram.
          </p>
        </div>
      )}

      <p className="rounded-control border border-dashed border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Rascunho de tela para revisão: ainda não grava o agendamento.
      </p>

      <FormField id="appointment-client" label="Cliente" required>
        <Combobox
          id="appointment-client"
          options={clients.map((client) => ({
            value: client.id,
            label: client.name,
          }))}
          value={clientId}
          onValueChange={setClientId}
          placeholder="Selecione o cliente"
          searchPlaceholder="Buscar cliente…"
          emptyMessage="Nenhum cliente encontrado."
        />
      </FormField>

      <FormField id="appointment-service" label="Serviço" required>
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger id="appointment-service" className="w-full">
            <SelectValue placeholder="Selecione o serviço" />
          </SelectTrigger>
          <SelectContent>
            {services.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name} · {formatDuration(item.duration)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="appointment-professional" label="Profissional" required>
        <Select
          value={professionalId || undefined}
          onValueChange={(next) => {
            setProfessionalId(next);
            // Os horários do encaixe dependem do profissional.
            if (overbooking) setTime("");
          }}
        >
          <SelectTrigger id="appointment-professional" className="w-full">
            <SelectValue placeholder="Selecione o profissional" />
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

      <div className="grid grid-cols-2 gap-3">
        <FormField id="appointment-date" label="Data" required>
          <DatePicker id="appointment-date" name="date" initialValue={date} />
        </FormField>
        <FormField id="appointment-time" label="Horário" required>
          {overbooking ? (
            <Select value={time || undefined} onValueChange={setTime}>
              <SelectTrigger id="appointment-time" className="w-full">
                <SelectValue
                  placeholder={
                    overbookingOptions.length > 0
                      ? "Selecione"
                      : "Sem horário disponível"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {overbookingOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="appointment-time"
              type="time"
              step={1800}
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          )}
        </FormField>
      </div>

      {endsAt && (
        <p className="text-sm text-muted-foreground">
          Término previsto: <span className="tabular-nums">{endsAt}</span>
        </p>
      )}

      <FormField id="appointment-note" label="Observações">
        <Textarea
          id="appointment-note"
          rows={3}
          placeholder="Preferências, cuidados, informações úteis para o atendimento"
        />
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
        <Button type="submit">Agendar</Button>
      </DialogFooter>
    </form>
  );
}
