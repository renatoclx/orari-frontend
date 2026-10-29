"use client";

import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import { enrollInClassGroupAction } from "@/app/(admin)/class-session-actions";
import { classGroupLabel } from "@/components/class-groups/class-group-rules";
import {
  occurrences,
  shortDayLabel,
} from "@/components/recurrences/recurrence-schedule";
import {
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
import type { ClassGroupItem } from "@/types/class-group";
import { shiftDateString } from "@/utils/time";

// Quantas datas à frente o diálogo oferece (as próximas sessões da turma).
const NEXT_SESSIONS = 8;
// Janela de busca dessas datas: 8 semanas cobrem até a turma de um dia só.
const SEARCH_DAYS = 8 * 7;

type EnrollClassGroupDialogProps = {
  /** Turma em que os clientes entram; nula com o diálogo fechado. */
  classGroup: ClassGroupItem | null;
  /** Primeiros clientes, para a busca. */
  clients: ClientOption[];
  /** Hoje e agora no fuso da empresa: só sessões que ainda não começaram. */
  today: string;
  nowMinutes: number;
  onClose: () => void;
};

/**
 * Encaixe avulso na turma fixa: um ou mais clientes numa das próximas sessões.
 * A sessão do dia é criada no primeiro encaixe; cada aluno ganha um agendamento
 * avulso (cobrado como qualquer outro).
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

function EnrollForm({
  classGroup,
  clients,
  today,
  nowMinutes,
  onClose,
}: EnrollClassGroupDialogProps & { classGroup: ClassGroupItem }) {
  const [students, setStudents] = useState<PickedStudent[]>([]);
  const [slot, setSlot] = useState("");
  const [errors, setErrors] = useState<{ client?: string; slot?: string }>({});
  const [pending, startTransition] = useTransition();

  // As próximas sessões, pelos dias e horários da turma (o que já começou fica de fora).
  const sessions = occurrences(
    today,
    shiftDateString(today, SEARCH_DAYS),
    classGroup.days,
    today,
    nowMinutes,
  ).slice(0, NEXT_SESSIONS);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = {
      slot: slot ? undefined : "Escolha a data da sessão.",
      client: students.length ? undefined : "Selecione ao menos um cliente.",
    };
    setErrors(found);
    if (found.client || found.slot) {
      document
        .getElementById(found.slot ? "enroll-slot" : "enroll-client")
        ?.focus();
      return;
    }

    const [date, time] = slot.split("|");
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
      // Ficam na lista só os que não entraram, com o motivo (ex.: sessão lotada).
      setStudents(failed);
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
          onValueChange={(next) => {
            setSlot(next);
            setErrors((current) => ({ ...current, slot: undefined }));
            // Os motivos eram da sessão anterior.
            setStudents((current) =>
              current.map((student) => ({ ...student, error: undefined })),
            );
          }}
        >
          <SelectTrigger id="enroll-slot" className="w-full">
            <SelectValue placeholder="Escolha a data…" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map(({ date, day }) => (
              <SelectItem
                key={`${date}|${day.startTime}`}
                value={`${date}|${day.startTime}`}
              >
                {shortDayLabel(date)} às {day.startTime}
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
