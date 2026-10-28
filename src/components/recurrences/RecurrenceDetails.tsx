"use client";

import { useState, useTransition } from "react";
import { Ban, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  cancelRecurrenceAction,
  updateRecurrenceNoteAction,
} from "@/app/(admin)/recurrence-actions";
import { useAgendaClock } from "@/components/agenda/useAgendaClock";
import { describeDays } from "@/components/recurrences/recurrence-schedule";
import { RecurrenceStatusBadge } from "@/components/recurrences/RecurrenceStatusBadge";
import { RecurrenceSessions } from "@/components/recurrences/RecurrenceSessions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { RecurrenceItem, RecurrenceSession } from "@/types/recurrence";
import { formatDateOnly, formatDuration } from "@/utils/format";

type RecurrenceDetailsProps = {
  recurrence: RecurrenceItem;
  sessions: RecurrenceSession[];
  timeZone: string;
  /** Instante em que o servidor montou a página (primeiro desenho do relógio). */
  serverNow: number;
};

/** Dados da recorrência e suas sessões, com cancelar e remanejar. */
export function RecurrenceDetails({
  recurrence,
  sessions,
  timeZone,
  serverNow,
}: RecurrenceDetailsProps) {
  const { today, nowTime } = useAgendaClock(timeZone, serverNow);

  const [cancellingAll, setCancellingAll] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [pending, startTransition] = useTransition();

  function cancelAll() {
    startTransition(async () => {
      const result = await cancelRecurrenceAction(recurrence.id);
      if (result.ok) {
        toast.success("Recorrência cancelada.", {
          description: recurrence.client.name,
        });
        setCancellingAll(false);
      } else {
        toast.error("Não foi possível cancelar a recorrência.", {
          description: result.message,
        });
      }
    });
  }

  function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateRecurrenceNoteAction(recurrence.id, noteDraft);
      if (result.ok) {
        toast.success("Observações salvas.");
        setEditingNote(false);
      } else {
        toast.error("Não foi possível salvar as observações.", {
          description: result.message,
        });
      }
    });
  }

  const rows: [string, React.ReactNode][] = [
    ["Cliente", recurrence.client.name],
    ["Profissional", recurrence.professional.name],
    [
      "Serviço",
      `${recurrence.service.name} · ${formatDuration(recurrence.service.duration)}`,
    ],
    ["Dias", describeDays(recurrence.days)],
    [
      "Período",
      `${formatDateOnly(recurrence.startDate)} a ${formatDateOnly(recurrence.endDate)}`,
    ],
    ...(recurrence.clientPlanId
      ? ([
          ["Origem", "Pacote (encerrada pelo cancelamento da contratação)"],
        ] as [string, React.ReactNode][])
      : []),
    ["Observações", <EmptyValue key="note">{recurrence.note}</EmptyValue>],
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
      <section className="rounded-card border border-border bg-card p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold">Dados da recorrência</h2>
            <RecurrenceStatusBadge active={recurrence.isActive} />
          </div>
          {recurrence.isActive && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button
                variant="outline"
                onClick={() => {
                  setNoteDraft(recurrence.note ?? "");
                  setEditingNote(true);
                }}
              >
                <Pencil aria-hidden="true" />
                Editar observações
              </Button>
              {/* A recorrência de um pacote só é encerrada pela contratação. */}
              {!recurrence.clientPlanId && (
                <Button
                  variant="destructive"
                  onClick={() => setCancellingAll(true)}
                >
                  <Ban aria-hidden="true" />
                  Cancelar recorrência
                </Button>
              )}
            </div>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex min-h-64 flex-col rounded-card border border-border bg-card">
        <h2 className="border-b border-border px-4 py-3 font-semibold md:px-6">
          Sessões ({sessions.length})
        </h2>
        <div className="min-h-0 flex-1 overflow-auto">
          <RecurrenceSessions
            recurrenceId={recurrence.id}
            sessions={sessions}
            active={recurrence.isActive}
            timeZone={timeZone}
            today={today}
            nowTime={nowTime}
            professional={recurrence.professional}
            clientName={recurrence.client.name}
            duration={recurrence.service.duration}
            period={{ start: recurrence.startDate, end: recurrence.endDate }}
          />
        </div>
      </section>

      <ConfirmDialog
        open={cancellingAll}
        onOpenChange={setCancellingAll}
        title="Cancelar recorrência?"
        description="As sessões futuras que ainda não começaram serão canceladas e os horários ficarão livres. O que já aconteceu permanece."
        confirmLabel="Cancelar recorrência"
        icon={Ban}
        pendingLabel="Cancelando…"
        cancelLabel="Voltar"
        pending={pending}
        destructive
        onConfirm={cancelAll}
      />

      <Dialog open={editingNote} onOpenChange={setEditingNote}>
        <DialogContent className="sm:max-w-md">
          <form noValidate onSubmit={saveNote} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Editar observações</DialogTitle>
              <DialogDescription>
                Observações da recorrência de {recurrence.client.name}.
              </DialogDescription>
            </DialogHeader>
            <FormField id="recurrence-note-edit" label="Observações">
              <Textarea
                id="recurrence-note-edit"
                rows={4}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
              />
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setEditingNote(false)}
              >
                <X aria-hidden="true" />
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                <Save aria-hidden="true" />
                {pending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
