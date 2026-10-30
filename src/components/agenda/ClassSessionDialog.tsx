"use client";

import {
  Clock,
  Pencil,
  Plus,
  Save,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import {
  enrollInClassGroupAction,
  enrollInClassSessionAction,
  getClassSessionAction,
  updateClassSessionCapacityAction,
} from "@/app/(admin)/class-session-actions";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
import {
  classSessionKey,
  type AgendaClassSession,
} from "@/components/agenda/class-session-blocks";
import {
  CAPACITY_MAX,
  CAPACITY_MIN,
  capacityError,
} from "@/components/class-groups/class-group-rules";
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
import { PersonAvatar } from "@/components/shared/PersonAvatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassSessionItem } from "@/types/class-group";

type ClassSessionDialogProps = {
  /** Sessão clicada na grade; nula com o diálogo fechado. */
  session: AgendaClassSession | null;
  /** Dia da agenda ("aaaa-mm-dd"): o encaixe no horário ainda sem sessão usa a data. */
  date: string;
  /** A sessão já começou: não recebe alunos nem muda vagas. */
  started: boolean;
  /** Primeiros clientes, para a busca do "Adicionar alunos". */
  clients: ClientOption[];
  /** Abre o agendamento do aluno (situação, falta, cancelar). */
  onOpenAppointment: (appointmentId: string) => void;
  onOpenChange: (open: boolean) => void;
};

/**
 * Sessão de turma: vagas, alunos e o encaixe de mais alunos. Cada aluno tem o
 * próprio agendamento, aberto no diálogo de sempre: as regras de cancelar e
 * de falta continuam lá, sem se repetir aqui.
 */
export function ClassSessionDialog({
  session,
  date,
  started,
  clients,
  onOpenAppointment,
  onOpenChange,
}: ClassSessionDialogProps) {
  return (
    <Dialog open={session !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {session && (
          // A chave recomeça o estado (dados, campos) a cada sessão aberta.
          <SessionDetails
            key={classSessionKey(session)}
            session={session}
            date={date}
            started={started}
            clients={clients}
            onOpenAppointment={onOpenAppointment}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// O que o diálogo mostra da sessão: a resposta da API ou, no horário ainda sem
// sessão, os mesmos campos montados a partir da turma.
type SessionView = Pick<
  ClassSessionItem,
  | "classGroupId"
  | "classGroup"
  | "capacity"
  | "cancelledAt"
  | "appointments"
  | "occupied"
  | "available"
>;

function SessionDetails({
  session,
  date,
  started,
  clients,
  onOpenAppointment,
  onClose,
}: {
  session: AgendaClassSession;
  date: string;
  started: boolean;
  clients: ClientOption[];
  onOpenAppointment: (appointmentId: string) => void;
  onClose: () => void;
}) {
  // Vagas e alunos vêm da API (a grade só tem os agendamentos do dia).
  const [data, setData] = useState<ClassSessionItem | null>(null);
  const [failed, setFailed] = useState(false);
  const [students, setStudents] = useState<PickedStudent[]>([]);
  const [studentsMessage, setStudentsMessage] = useState<string>();
  const [capacity, setCapacity] = useState<string | null>(null);
  const [capacityMessage, setCapacityMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // Horário sem sessão: não há o que buscar (a sessão nasce no primeiro encaixe).
    if (session.id === null) return;
    let current = true;
    getClassSessionAction(session.id).then((result) => {
      if (!current) return;
      if (result.ok) setData(result.session);
      else {
        setFailed(true);
        toast.error("Não foi possível carregar a turma.", {
          description: result.message,
        });
      }
    });
    return () => {
      current = false;
    };
  }, [session.id]);

  // Sem sessão ainda: ninguém encaixado e as vagas da turma.
  const view: SessionView | null =
    data ??
    (session.id === null
      ? {
          classGroupId: session.classGroupId,
          classGroup: session.classGroupId
            ? { id: session.classGroupId, name: session.classGroupName ?? null }
            : null,
          capacity: session.capacity,
          cancelledAt: null,
          appointments: [],
          occupied: 0,
          available: session.capacity,
        }
      : null);
  const open = view !== null && !started && view.cancelledAt === null;

  function enroll() {
    if (!view) return;
    if (students.length === 0) {
      toast.error("Selecione ao menos um cliente.");
      return;
    }
    // Sem vaga para todos, ninguém entra: o usuário ajusta a lista ou as vagas.
    const shortage = capacityShortage(view.available, students.length);
    setStudentsMessage(shortage);
    if (shortage) return;
    // Com sessão, encaixa nela; sem sessão, pela turma (a API cria a sessão no
    // primeiro encaixe e usa a mesma nos seguintes).
    const sessionId = data?.id ?? session.id;
    const classGroupId = session.classGroupId;
    const enrollOne = (clientId: string) =>
      sessionId
        ? enrollInClassSessionAction(sessionId, clientId)
        : enrollInClassGroupAction(
            classGroupId!,
            clientId,
            date,
            session.start,
          );
    startTransition(async () => {
      const {
        added,
        failed,
        session: updated,
      } = await enrollInOrder(students, enrollOne);
      if (added > 0 && updated) {
        setData(updated);
        toast.success(
          added === 1
            ? "Aluno adicionado à turma."
            : `${studentsLabel(added)} adicionados à turma.`,
        );
      }
      // Ficam na lista só os que não entraram, com o motivo (ex.: sessão lotada).
      setStudents(failed);
      if (failed.length > 0) {
        toast.error(
          `Não foi possível adicionar ${studentsLabel(failed.length)}.`,
          { description: "O motivo está ao lado de cada nome." },
        );
      }
    });
  }

  function saveCapacity() {
    // "Alterar vagas" só aparece com a sessão criada.
    if (capacity === null || !data) return;
    const message = capacityError(capacity);
    setCapacityMessage(message);
    if (message) return;
    startTransition(async () => {
      const result = await updateClassSessionCapacityAction(
        data.id,
        Number(capacity),
      );
      if (result.ok) {
        toast.success("Vagas atualizadas.");
        setData(result.session);
        setCapacity(null);
        // Com mais vagas, o aviso de falta de vaga pode já não valer.
        setStudentsMessage(undefined);
        return;
      }
      // Ex.: menos vagas do que alunos.
      toast.error("Não foi possível alterar as vagas.", {
        description: result.message,
      });
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: session.serviceColor }}
            aria-hidden="true"
          />
          Turma de {session.serviceName}
        </DialogTitle>
        <DialogDescription>
          {view
            ? (view.classGroup?.name ??
              (view.classGroupId ? "Turma fixa" : "Turma avulsa"))
            : "Carregando…"}
        </DialogDescription>
      </DialogHeader>

      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Clock
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="tabular-nums">
            {session.start} às {session.end}
          </span>
        </li>
        <li className="flex items-center gap-2">
          <UserRound
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          com {session.professionalName}
        </li>
        <li className="flex min-h-10 items-center gap-2">
          <UsersRound
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {capacity === null ? (
            <>
              <span className="tabular-nums">
                {view
                  ? `${view.occupied} de ${view.capacity} vagas ocupadas`
                  : `${session.occupied} de ${session.capacity} vagas ocupadas`}
              </span>
              {open && data && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setCapacity(String(data.capacity))}
                >
                  <Pencil aria-hidden="true" />
                  Alterar vagas
                </Button>
              )}
            </>
          ) : (
            // Edição das vagas no lugar do texto: campo, salvar e desistir.
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={CAPACITY_MIN}
                  max={CAPACITY_MAX}
                  value={capacity}
                  aria-label="Vagas da sessão"
                  aria-invalid={capacityMessage ? true : undefined}
                  className="w-24"
                  autoFocus
                  onChange={(event) => {
                    setCapacity(event.target.value.replace(/\D/g, ""));
                    setCapacityMessage(undefined);
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={pending}
                  onClick={saveCapacity}
                >
                  <Save aria-hidden="true" />
                  Salvar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Desistir de alterar as vagas"
                  disabled={pending}
                  onClick={() => {
                    setCapacity(null);
                    setCapacityMessage(undefined);
                  }}
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
              {capacityMessage && (
                <p role="alert" className="text-sm text-destructive">
                  {capacityMessage}
                </p>
              )}
            </div>
          )}
        </li>
      </ul>

      <section className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-medium">Alunos</h3>
        {view && view.appointments.length === 0 ? (
          // Horário da turma ainda sem ninguém encaixado.
          <p className="text-sm text-muted-foreground">Nenhum aluno ainda.</p>
        ) : view ? (
          <ul className="divide-y divide-border rounded-control border border-border">
            {view.appointments.map((participant) => {
              const { label, icon: StatusIcon } =
                APPOINTMENT_STATUS[participant.status];
              return (
                <li key={participant.id}>
                  {/* O agendamento do aluno: situação, falta e cancelamento. */}
                  <button
                    type="button"
                    onClick={() => onOpenAppointment(participant.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <PersonAvatar
                      name={participant.client.name}
                      photoUrl={participant.client.photoUrl}
                      size="sm"
                    />
                    <span
                      className={`min-w-0 flex-1 truncate ${participant.status === "CANCELLED" ? "text-muted-foreground line-through" : ""}`}
                    >
                      {participant.client.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <StatusIcon className="size-4" aria-hidden="true" />
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : failed ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os alunos.
          </p>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
      </section>

      {view &&
        (open ? (
          view.available > 0 ? (
            <FormField
              id="class-session-client"
              label="Adicionar alunos"
              error={studentsMessage}
            >
              <StudentPicker
                id="class-session-client"
                clients={clients}
                selected={students}
                onChange={(next) => {
                  setStudents(next);
                  setStudentsMessage(undefined);
                }}
                // Quem já está na sessão não aparece de novo.
                excludeIds={view.appointments
                  .filter((p) => p.status !== "CANCELLED")
                  .map((p) => p.client.id)}
                disabled={pending}
              />
              {students.length > 0 && (
                <Button
                  type="button"
                  className="w-full"
                  disabled={pending}
                  onClick={enroll}
                >
                  <Plus aria-hidden="true" />
                  {pending
                    ? "Adicionando…"
                    : `Adicionar ${studentsLabel(students.length)}`}
                </Button>
              )}
            </FormField>
          ) : (
            <p className="text-sm text-muted-foreground">
              Turma lotada: aumente as vagas para adicionar outros alunos.
            </p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            {view.cancelledAt
              ? "Sessão cancelada."
              : "A sessão já começou: não recebe novos alunos."}
          </p>
        ))}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          <X aria-hidden="true" />
          Fechar
        </Button>
      </DialogFooter>
    </>
  );
}
