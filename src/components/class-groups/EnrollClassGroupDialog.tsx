"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import {
  enrollInClassGroupAction,
  listUpcomingSessionsAction,
} from "@/app/(admin)/class-session-actions";
import { classGroupLabel } from "@/components/class-groups/class-group-rules";
import { shortDayLabel } from "@/components/recurrences/recurrence-schedule";
import {
  capacityShortage,
  enrollInOrder,
  studentsLabel,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClassGroupItem, UpcomingClassSession } from "@/types/class-group";

type EnrollClassGroupDialogProps = {
  /** Turma em que os clientes entram; nula com o diálogo fechado. */
  classGroup: ClassGroupItem | null;
  /** Primeiros clientes, para a busca. */
  clients: ClientOption[];
  onClose: () => void;
};

/**
 * Encaixe avulso na turma fixa: um ou mais clientes numa das próximas sessões
 * (4 semanas), cada uma com as vagas. A sessão do dia é criada no primeiro
 * encaixe; cada aluno ganha um agendamento avulso (cobrado como qualquer outro).
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

// Valor do Select: data e horário identificam a sessão (mesmo sem id).
const slotKey = (session: UpcomingClassSession) =>
  `${session.date}|${session.time}`;

// "segunda, 02/11 às 09:00 · 2 de 4 vagas" (ou cancelada, ou lotada).
function slotLabel(session: UpcomingClassSession) {
  const when = `${shortDayLabel(session.date)} às ${session.time}`;
  if (session.cancelledAt) return `${when} · cancelada`;
  if (session.available === 0) return `${when} · lotada`;
  return `${when} · ${session.occupied} de ${session.capacity} vagas`;
}

function EnrollForm({
  classGroup,
  clients,
  onClose,
}: EnrollClassGroupDialogProps & { classGroup: ClassGroupItem }) {
  const [students, setStudents] = useState<PickedStudent[]>([]);
  const [slot, setSlot] = useState("");
  const [errors, setErrors] = useState<{ client?: string; slot?: string }>({});
  // Próximas sessões com as vagas; nulo enquanto carrega.
  const [sessions, setSessions] = useState<UpcomingClassSession[] | null>(null);
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
  }, [classGroup.id]);

  const selected = sessions?.find((session) => slotKey(session) === slot);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = {
      slot: selected ? undefined : "Escolha a data da sessão.",
      client: students.length
        ? // Sem vaga para todos, ninguém entra: ajusta-se a lista ou a data.
          selected && capacityShortage(selected.available, students.length)
        : "Selecione ao menos um cliente.",
    };
    setErrors(found);
    if (found.client || found.slot || !selected) {
      document
        .getElementById(found.slot ? "enroll-slot" : "enroll-client")
        ?.focus();
      return;
    }

    const { date, time } = selected;
    startTransition(async () => {
      const { added, failed, session } = await enrollInOrder(
        students,
        (clientId) =>
          enrollInClassGroupAction(classGroup.id, clientId, date, time),
      );
      if (added > 0 && session) {
        toast.success(
          added === 1
            ? "Aluno adicionado à turma."
            : `${studentsLabel(added)} adicionados à turma.`,
          {
            description: `${shortDayLabel(date)} às ${time} (${session.occupied} de ${session.capacity} vagas)`,
          },
        );
      }
      if (failed.length === 0) {
        onClose();
        return;
      }
      // Ficam na lista só os que não entraram, com o motivo; as vagas da data
      // são atualizadas com o que entrou.
      setStudents(failed);
      if (session) {
        setSessions((current) =>
          (current ?? []).map((item) =>
            slotKey(item) === slot
              ? {
                  ...item,
                  occupied: session.occupied,
                  available: session.available,
                }
              : item,
          ),
        );
      }
      toast.error(
        `Não foi possível adicionar ${studentsLabel(failed.length)}.`,
        {
          description: "O motivo está ao lado de cada nome.",
        },
      );
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Adicionar alunos</DialogTitle>
        <DialogDescription>
          Encaixe clientes em uma sessão de {classGroupLabel(classGroup)}, com{" "}
          {classGroup.professional.name}. Cada um ganha um agendamento avulso,
          como qualquer outro.
        </DialogDescription>
      </DialogHeader>

      {/* A sessão vem primeiro: todos os escolhidos entram nela. */}
      <FormField id="enroll-slot" label="Sessão" required error={errors.slot}>
        <Select
          value={slot || undefined}
          disabled={sessions === null}
          onValueChange={(next) => {
            setSlot(next);
            setErrors({});
            // Os motivos eram da sessão anterior.
            setStudents((current) =>
              current.map((student) => ({ ...student, error: undefined })),
            );
          }}
        >
          <SelectTrigger id="enroll-slot" className="w-full">
            <SelectValue
              placeholder={
                sessions === null ? "Carregando sessões…" : "Escolha a data…"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {sessions?.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                Nenhuma sessão nas próximas 4 semanas.
              </p>
            )}
            {sessions?.map((session) => (
              <SelectItem
                key={slotKey(session)}
                value={slotKey(session)}
                // Cancelada ou lotada: aparece, mas não se escolhe.
                disabled={
                  session.cancelledAt !== null || session.available === 0
                }
              >
                {slotLabel(session)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
