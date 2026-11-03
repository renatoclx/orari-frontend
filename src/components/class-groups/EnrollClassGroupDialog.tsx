"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import {
  enrollInClassGroupDatesAction,
  listUpcomingSessionsAction,
} from "@/app/(admin)/class-session-actions";
import { classGroupLabel } from "@/components/class-groups/class-group-rules";
import { shortDayLabel } from "@/components/recurrences/recurrence-schedule";
import {
  datesShortage,
  failedOutcomes,
  failureSummary,
  refusalsOfFailures,
  studentsLabel,
  withRefusals,
} from "@/components/class-groups/enroll-students";
import {
  StudentPicker,
  type PickedStudent,
} from "@/components/class-groups/StudentPicker";
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
import type { ClassGroupItem, UpcomingClassSession } from "@/types/class-group";

type EnrollClassGroupDialogProps = {
  /** Turma em que os clientes entram; nula com o diálogo fechado. */
  classGroup: ClassGroupItem | null;
  /** Primeiros clientes, para a busca. */
  clients: ClientOption[];
  onClose: () => void;
};

/**
 * Encaixe avulso na turma fixa: um ou mais clientes em uma ou mais das próximas
 * sessões (4 semanas), cada uma com as vagas. A sessão do dia é criada no
 * primeiro encaixe; cada aluno ganha um agendamento avulso por data (cobrado
 * como qualquer outro).
 */
export function EnrollClassGroupDialog({
  classGroup,
  onClose,
  ...rest
}: EnrollClassGroupDialogProps) {
  return (
    <Dialog
      open={classGroup !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        {classGroup && (
          <EnrollForm
            key={classGroup.id}
            classGroup={classGroup}
            onClose={onClose}
            {...rest}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Chave da sessão na lista: data e horário a identificam (mesmo sem id).
const slotKey = (session: UpcomingClassSession) =>
  `${session.date}|${session.time}`;

// "segunda, 02/11 às 09:00"
const slotWhen = (session: { date: string; time: string }) =>
  `${shortDayLabel(session.date)} às ${session.time}`;

// "2 de 4 vagas", "cancelada" ou "lotada".
function slotStatus(session: UpcomingClassSession) {
  if (session.cancelledAt) return "cancelada";
  if (session.available === 0) return "lotada";
  return `${session.occupied} de ${session.capacity} vagas`;
}

// Cancelada ou lotada: aparece, mas não se escolhe.
const isDisabled = (session: UpcomingClassSession) =>
  session.cancelledAt !== null || session.available === 0;

function EnrollForm({
  classGroup,
  clients,
  onClose,
}: EnrollClassGroupDialogProps & { classGroup: ClassGroupItem }) {
  const [students, setStudents] = useState<PickedStudent[]>([]);
  // Chaves das sessões marcadas.
  const [picked, setPicked] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ client?: string; slot?: string }>({});
  // Próximas sessões com as vagas; nulo enquanto carrega.
  const [sessions, setSessions] = useState<UpcomingClassSession[] | null>(null);
  // Muda depois de um encaixe parcial, para recarregar as vagas.
  const [reload, setReload] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let current = true;
    listUpcomingSessionsAction(classGroup.id).then((result) => {
      if (!current) return;
      if (result.ok) setSessions(result.sessions);
      else {
        setSessions([]);
        toast.error("Não foi possível carregar as sessões.", {
          description: result.message,
        });
      }
    });
    return () => {
      current = false;
    };
  }, [classGroup.id, reload]);

  const selected = (sessions ?? []).filter((session) =>
    picked.includes(slotKey(session)),
  );

  function togglePicked(key: string, checked: boolean) {
    setPicked((current) =>
      checked ? [...current, key] : current.filter((item) => item !== key),
    );
    setErrors({});
    // Os motivos eram de outra escolha de datas.
    setStudents((current) =>
      current.map((student) => ({ ...student, error: undefined })),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = {
      slot: selected.length ? undefined : "Escolha ao menos uma data.",
      client: students.length
        ? // Sem vaga para todos em alguma data, ninguém entra: ajusta-se a lista ou as datas.
          datesShortage(
            selected.map((session) => ({
              label: slotWhen(session),
              available: session.available,
            })),
            students.length,
          )
        : "Selecione ao menos um cliente.",
    };
    setErrors(found);
    if (found.client || found.slot) {
      document
        .getElementById(found.slot ? "enroll-slot" : "enroll-client")
        ?.focus();
      return;
    }

    startTransition(async () => {
      const result = await enrollInClassGroupDatesAction(
        classGroup.id,
        students.map((student) => student.id),
        selected.map(({ date, time }) => ({ date, time })),
      );
      if (!result.ok) {
        toast.error("Nenhum aluno foi adicionado.", {
          description: result.message,
        });
        return;
      }

      const failures = failedOutcomes(result.outcomes);
      const done = result.outcomes.length - failures.length;
      if (failures.length === 0) {
        toast.success(
          done === 1
            ? students.length === 1
              ? "Aluno adicionado à turma."
              : `${studentsLabel(students.length)} adicionados à turma.`
            : `${studentsLabel(students.length)} adicionados em ${done} sessões.`,
        );
        onClose();
        return;
      }

      // Ficam marcadas só as datas recusadas, para tentar de novo sem repetir
      // as que já entraram; cada recusado mostra o motivo no nome.
      const labelOf = (outcome: { date: string; time: string }) =>
        slotWhen(outcome);
      setPicked(failures.map((failure) => `${failure.date}|${failure.time}`));
      setStudents(
        withRefusals(students, refusalsOfFailures(failures, labelOf)),
      );
      setReload((current) => current + 1);
      const reason = failureSummary(failures, labelOf);
      if (done === 0) {
        toast.error("Nenhum aluno foi adicionado.", { description: reason });
      } else {
        toast.warning(
          `Adicionado em ${done} de ${result.outcomes.length} sessões.`,
          { description: `Não entrou: ${reason}` },
        );
      }
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Adicionar alunos</DialogTitle>
        <DialogDescription>
          Encaixe clientes em sessões de {classGroupLabel(classGroup)}, com{" "}
          {classGroup.professional.name}. Cada um ganha um agendamento avulso
          por data, como qualquer outro.
        </DialogDescription>
      </DialogHeader>

      {/* As datas vêm primeiro: todos os escolhidos entram em cada uma. */}
      <FormField id="enroll-slot" label="Sessões" required error={errors.slot}>
        <div
          id="enroll-slot"
          role="group"
          aria-label="Sessões"
          tabIndex={-1}
          className="max-h-56 space-y-1 overflow-y-auto p-0.5"
        >
          {sessions === null && (
            <p className="px-1 py-1.5 text-sm text-muted-foreground">
              Carregando sessões…
            </p>
          )}
          {sessions?.length === 0 && (
            <p className="px-1 py-1.5 text-sm text-muted-foreground">
              Nenhuma sessão nas próximas 4 semanas.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {sessions?.map((session) => {
              const key = slotKey(session);
              const marked = picked.includes(key);
              return (
                <Button
                  key={key}
                  type="button"
                  variant={marked ? "default" : "outline"}
                  aria-pressed={marked}
                  disabled={isDisabled(session) || pending}
                  onClick={() => togglePicked(key, !marked)}
                  // Duas linhas: a data com o horário e as vagas (os botões
                  // de horário da agenda têm só uma, estes precisam das vagas).
                  className="h-auto min-w-0 flex-col gap-0 py-1.5 tabular-nums"
                >
                  <span className="max-w-full truncate">
                    {slotWhen(session)}
                  </span>
                  <span className="text-xs font-normal opacity-80">
                    {slotStatus(session)}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
        {selected.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selected.length === 1
              ? "1 sessão marcada"
              : `${selected.length} sessões marcadas`}
          </p>
        )}
      </FormField>

      <FormField
        id="enroll-client"
        label="Alunos"
        required
        error={errors.client}
      >
        <StudentPicker
          id="enroll-client"
          clients={clients}
          selected={students}
          onChange={(next) => {
            setStudents(next);
            setErrors((current) => ({ ...current, client: undefined }));
          }}
          disabled={pending}
        />
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onClose}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending
            ? "Adicionando…"
            : students.length > 1
              ? `Adicionar ${studentsLabel(students.length)}`
              : "Adicionar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
