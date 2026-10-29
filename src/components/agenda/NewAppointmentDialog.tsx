"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CalendarPlus, Save, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import {
  createAppointmentAction,
  updateAppointmentAction,
  getAvailabilityAction,
  searchClientsAction,
  type Availability,
  type ClientOption,
} from "@/app/(admin)/appointment-actions";
import { AvailableTimes } from "@/components/agenda/AvailableTimes";
import {
  availableOverbookingStarts,
  availableStarts,
} from "@/components/agenda/agenda-availability";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AgendaAppointment, AgendaProfessional } from "@/types/agenda";
import { formatDuration } from "@/utils/format";
import { minutesToTime, timeToMinutes } from "@/utils/time";

/** Serviço como o formulário o oferece. */
export type AgendaServiceOption = {
  id: string;
  name: string;
  /** Em minutos. */
  duration: number;
  /** Aceita turma: o agendamento pode virar turma (só a agenda usa). */
  allowsClasses?: boolean;
};

/** Cliente como o formulário o oferece. */
export type AgendaClientOption = ClientOption;

type NewAppointmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionals: AgendaProfessional[];
  services: AgendaServiceOption[];
  clients: AgendaClientOption[];
  /** Dia da agenda, "aaaa-mm-dd". */
  date: string;
  /** Hoje, "aaaa-mm-dd", no fuso da empresa: não se agenda antes disso. */
  today: string;
  /** Profissional e horário do intervalo clicado (nulos no botão geral). */
  initial: {
    professionalId: string | null;
    time: string | null;
    /** Encaixe: agendamento fora do horário de funcionamento. */
    overbooking: boolean;
  };
  /** Alteração: o agendamento a alterar (o dialog abre preenchido com ele). */
  editing?: AgendaAppointment;
};

// Novo agendamento, encaixe (fora do expediente) e alteração: mesmo dialog e
// mesmos campos. O encaixe muda só quais horários são oferecidos e o envio do
// `overBooking`; a alteração abre preenchida e envia apenas o que mudou.
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
  today,
  initial,
  editing,
}: NewAppointmentDialogProps) {
  // Na alteração, o tipo (comum ou encaixe) é o do próprio agendamento.
  const overbooking = editing ? editing.overbooking : initial.overbooking;
  // Horário "desejado": o do agendamento (alteração) ou o clicado na agenda.
  const desiredTime = editing ? editing.start : initial.time;

  const [clientId, setClientId] = useState(editing?.clientId ?? "");
  const [serviceId, setServiceId] = useState(editing?.serviceId ?? "");
  const [professionalId, setProfessionalId] = useState(
    editing?.professionalId ?? initial.professionalId ?? "",
  );
  // Não se agenda antes de hoje: a agenda aberta num dia passado começa em hoje.
  const [day, setDay] = useState(date < today ? today : date);
  const [time, setTime] = useState("");
  // O usuário já escolheu um horário (o clicado na agenda deixa de valer).
  const [touched, setTouched] = useState(false);
  const [note, setNote] = useState(editing?.note ?? "");
  const [errors, setErrors] = useState<{
    client?: string;
    service?: string;
    professional?: string;
    time?: string;
  }>({});
  const [pending, startTransition] = useTransition();

  // O serviço do agendamento continua na lista mesmo que tenha sido inativado.
  const serviceOptions = [...services];
  if (
    editing &&
    !serviceOptions.some((item) => item.id === editing.serviceId)
  ) {
    serviceOptions.push({
      id: editing.serviceId,
      name: editing.serviceName,
      duration: editing.durationMinutes,
    });
  }
  const service = serviceOptions.find((item) => item.id === serviceId);

  // --- Busca de clientes no servidor (a lista inicial traz os primeiros). ---
  const [clientOptions, setClientOptions] = useState<ClientOption[]>(clients);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [pickedClient, setPickedClient] = useState<ClientOption | undefined>(
    editing && { id: editing.clientId, name: editing.clientName },
  );
  const clientRequest = useRef(0);
  const clientDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(clientDebounce.current), []);

  function searchClients(term: string) {
    clearTimeout(clientDebounce.current);
    if (!term.trim()) {
      setClientOptions(clients);
      return;
    }
    clientDebounce.current = setTimeout(async () => {
      const request = ++clientRequest.current;
      setClientsLoading(true);
      const result = await searchClientsAction(term);
      if (request !== clientRequest.current) return;
      setClientsLoading(false);
      if (result.ok) setClientOptions(result.clients);
      else toast.error("Não foi possível buscar os clientes.");
    }, 300);
  }

  // O cliente escolhido continua na lista mesmo que a busca o tire dela.
  const clientList = [...clientOptions];
  if (pickedClient && !clientList.some((c) => c.id === pickedClient.id)) {
    clientList.unshift(pickedClient);
  }

  // --- Disponibilidade do profissional na data (agendamento comum). ---
  // O resultado guarda a chave (profissional, data, versão) a que se refere: se
  // a chave atual é outra, ainda está carregando. A versão sobe após um erro de
  // conflito, para buscar de novo.
  const [reload, setReload] = useState(0);
  const availabilityKey = `${professionalId}|${day}|${reload}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    availability?: Availability;
  }>();

  useEffect(() => {
    if (!professionalId) return;

    let cancelled = false;
    getAvailabilityAction(professionalId, day, editing?.id).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        toast.error("Não foi possível buscar os horários.", {
          description: result.message,
        });
      }
      setLoaded({
        key: availabilityKey,
        availability: result.ok ? result.availability : undefined,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [professionalId, day, reload, availabilityKey, editing?.id]);

  const availabilityLoading = loaded?.key !== availabilityKey;
  const availability = availabilityLoading ? undefined : loaded?.availability;

  // Comum: cabe inteiro em uma janela. Encaixe: inteiro fora de qualquer janela.
  const findStarts = overbooking ? availableOverbookingStarts : availableStarts;
  const starts =
    availability && service
      ? findStarts({
          windows: availability.windows,
          busy: availability.busy,
          duration: service.duration,
          notBefore: availability.notBefore,
        })
      : [];

  // Horário: o que o usuário escolheu; antes disso, o clicado na agenda (se
  // ainda estiver disponível para o serviço). Some se deixar de estar disponível
  // (outro serviço, profissional ou data).
  const wanted = touched ? time : (desiredTime ?? "");
  const currentTime =
    wanted && starts.includes(timeToMinutes(wanted)) ? wanted : "";

  // Término previsto: o início mais a duração do serviço.
  const endsAt =
    service && currentTime
      ? minutesToTime(
          Math.min(24 * 60, timeToMinutes(currentTime) + service.duration),
        )
      : null;

  // Alteração: só salva se algo mudou.
  const serviceChanged = editing ? serviceId !== editing.serviceId : false;
  const moved = editing
    ? day !== date || (currentTime !== "" && currentTime !== editing.start)
    : false;
  const noteChanged = editing ? note.trim() !== (editing.note ?? "") : false;
  const changed = editing
    ? clientId !== editing.clientId ||
      professionalId !== editing.professionalId ||
      serviceChanged ||
      moved ||
      noteChanged
    : true;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = {
      client: clientId ? undefined : "Selecione o cliente.",
      service: serviceId ? undefined : "Selecione o serviço.",
      professional: professionalId ? undefined : "Selecione o profissional.",
      time: currentTime ? undefined : "Selecione o horário.",
    };
    setErrors(found);
    const firstInvalid = (
      [
        ["client", "appointment-client"],
        ["service", "appointment-service"],
        ["professional", "appointment-professional"],
        ["time", "appointment-time"],
      ] as const
    ).find(([field]) => found[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid[1])?.focus();
      return;
    }

    startTransition(async () => {
      // Alteração: envia só o que mudou (o encaixe reenvia a autorização).
      if (editing) {
        const updated = await updateAppointmentAction({
          id: editing.id,
          ...(clientId !== editing.clientId && { clientId }),
          ...(professionalId !== editing.professionalId && { professionalId }),
          ...(serviceChanged && { serviceId }),
          ...((moved || professionalId !== editing.professionalId) && {
            date: day,
            time: currentTime,
          }),
          ...(noteChanged && { note }),
          ...(overbooking && { overBooking: true }),
        });

        if (updated.ok) {
          toast.success("Agendamento alterado.", {
            description: `${updated.dateLabel}, das ${updated.start} às ${updated.end}`,
          });
          onOpenChange(false);
          return;
        }

        if (updated.field) setErrors({ time: updated.message });
        toast.error("Não foi possível alterar o agendamento.", {
          description: updated.message,
        });
        setReload((version) => version + 1);
        return;
      }

      const result = await createAppointmentAction({
        clientId,
        professionalId,
        serviceId,
        date: day,
        time: currentTime,
        note,
        overBooking: overbooking,
      });

      if (result.ok) {
        toast.success(
          overbooking ? "Encaixe realizado." : "Agendamento realizado.",
          {
            description: `${result.dateLabel}, das ${result.start} às ${result.end}`,
          },
        );
        onOpenChange(false);
        return;
      }

      if (result.field) setErrors({ time: result.message });
      toast.error(
        overbooking
          ? "Não foi possível encaixar o agendamento."
          : "Não foi possível agendar.",
        { description: result.message },
      );
      // O horário pode ter sido ocupado por outra pessoa: atualiza a lista.
      setReload((version) => version + 1);
    });
  }

  // Mensagem enquanto não há horários para mostrar.
  const timesHint = (() => {
    if (!professionalId) return "Selecione o profissional.";
    if (!service) return "Selecione o serviço para ver os horários.";
    if (availabilityLoading || !availability) return "Buscando horários…";
    if (starts.length > 0) return null;

    // Dia fechado só impede o agendamento comum; o encaixe pode ser nele.
    if (overbooking) {
      return "Sem horários disponíveis fora do expediente neste dia. Tente outra data.";
    }
    if (availability.windows.length === 0 && availability.notBefore < 24 * 60) {
      return "A empresa não funciona neste dia. Use Encaixar horário, se precisar.";
    }
    return "Sem horários disponíveis neste dia para este serviço. Tente outra data ou use Encaixar horário.";
  })();

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {editing
            ? "Alterar agendamento"
            : overbooking
              ? "Encaixar horário"
              : "Novo agendamento"}
        </DialogTitle>
        <DialogDescription>
          {editing
            ? "Altere os dados do agendamento."
            : "Escolha o cliente, o serviço e o horário do atendimento."}
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
            {editing ? "Este agendamento é um encaixe" : "Você está agendando"}{" "}
            <strong>fora do horário de funcionamento</strong>. Só aparecem
            horários livres, inteiros fora do expediente, que ainda não
            passaram.
          </p>
        </div>
      )}

      <FormField
        id="appointment-client"
        label="Cliente"
        required
        error={errors.client}
      >
        <Combobox
          id="appointment-client"
          options={clientList.map((client) => ({
            value: client.id,
            label: client.name,
          }))}
          value={clientId}
          onValueChange={(next) => {
            setClientId(next);
            setPickedClient(clientList.find((client) => client.id === next));
            setErrors((current) => ({ ...current, client: undefined }));
          }}
          placeholder="Selecione o cliente"
          searchPlaceholder="Buscar cliente…"
          emptyMessage="Nenhum cliente encontrado."
          loading={clientsLoading}
          onSearchChange={searchClients}
        />
      </FormField>

      <FormField
        id="appointment-service"
        label="Serviço"
        required
        error={errors.service}
      >
        <Combobox
          id="appointment-service"
          options={serviceOptions.map((item) => ({
            value: item.id,
            label: `${item.name} · ${formatDuration(item.duration)}`,
          }))}
          value={serviceId}
          onValueChange={(next) => {
            setServiceId(next);
            setErrors((current) => ({ ...current, service: undefined }));
          }}
          placeholder="Selecione o serviço"
          searchPlaceholder="Buscar serviço…"
          emptyMessage="Nenhum serviço encontrado."
        />
      </FormField>

      <FormField
        id="appointment-professional"
        label="Profissional"
        required
        error={errors.professional}
      >
        <Select
          value={professionalId || undefined}
          onValueChange={(next) => {
            setProfessionalId(next);
            setErrors((current) => ({ ...current, professional: undefined }));
            // Os horários dependem do profissional (o horário some se deixar de valer).
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

      <FormField id="appointment-date" label="Data" required>
        <DatePicker
          id="appointment-date"
          name="date"
          initialValue={day}
          minDate={parseDay(today)}
          onValueChange={(next) => next && setDay(next)}
        />
      </FormField>

      <FormField
        id="appointment-time"
        label="Horário"
        required
        error={errors.time}
      >
        {timesHint ? (
          <p
            role="status"
            className="rounded-control border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
          >
            {timesHint}
          </p>
        ) : (
          <AvailableTimes
            id="appointment-time"
            starts={starts}
            value={currentTime}
            onChange={(next) => {
              setTime(next);
              setTouched(true);
              setErrors((current) => ({ ...current, time: undefined }));
            }}
            invalid={Boolean(errors.time)}
          />
        )}
      </FormField>

      {endsAt && (
        <p className="text-sm text-muted-foreground">
          Término previsto: <span className="tabular-nums">{endsAt}</span>
        </p>
      )}

      <FormField id="appointment-note" label="Observações">
        <Textarea
          id="appointment-note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Preferências, cuidados, informações úteis para o atendimento"
        />
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending || !changed}>
          {editing ? (
            <Save aria-hidden="true" />
          ) : (
            <CalendarPlus aria-hidden="true" />
          )}
          {editing
            ? pending
              ? "Salvando…"
              : "Salvar alterações"
            : pending
              ? "Agendando…"
              : "Agendar"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// "aaaa-mm-dd" → Date local (o calendário compara no relógio do navegador).
function parseDay(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
