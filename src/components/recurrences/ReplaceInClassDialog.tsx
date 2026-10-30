"use client";

import { UsersRound, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { listUpcomingSessionsAction } from "@/app/(admin)/class-session-actions";
import { replaceInClassGroupAction } from "@/app/(admin)/recurrence-actions";
import { ClassGroupSelect } from "@/components/class-groups/ClassGroupSelect";
import { shortDayLabel } from "@/components/recurrences/recurrence-schedule";
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

type ReplaceInClassDialogProps = {
  recurrenceId: string;
  /** Aula a levar para a turma; nula = fechado. */
  session: { id: string; label: string } | null;
  /** Turmas ativas do mesmo serviço da aula. */
  classGroups: ClassGroupItem[];
  /** Turma já escolhida ao abrir (a da recorrência, se houver). */
  defaultClassGroupId?: string | null;
  /** Período da recorrência ("aaaa-mm-dd"): a nova data fica dentro dele. */
  period: { start: string; end: string };
  clientName: string;
  onDone: () => void;
  onOpenChange: (open: boolean) => void;
};

/**
 * Reposição (ou remanejamento) de uma aula numa sessão de turma do mesmo
 * serviço: escolhe a turma e uma das próximas sessões com vaga. A aula entra
 * na sessão com o profissional da turma.
 */
export function ReplaceInClassDialog(props: ReplaceInClassDialogProps) {
  return (
    <Dialog open={props.session !== null} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {props.session && (
          <ReplaceForm
            key={props.session.id}
            {...props}
            session={props.session}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReplaceForm({
  recurrenceId,
  session,
  classGroups,
  defaultClassGroupId,
  period,
  clientName,
  onDone,
  onOpenChange,
}: ReplaceInClassDialogProps & { session: { id: string; label: string } }) {
  const [classGroupId, setClassGroupId] = useState(
    classGroups.some((group) => group.id === defaultClassGroupId)
      ? (defaultClassGroupId ?? "")
      : (classGroups[0]?.id ?? ""),
  );
  const [slot, setSlot] = useState("");
  const [error, setError] = useState<string>();
  // Próximas sessões da turma escolhida; a chave diz de qual turma são.
  const [loaded, setLoaded] = useState<{
    classGroupId: string;
    sessions: UpcomingClassSession[];
  }>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!classGroupId) return;
    let current = true;
    listUpcomingSessionsAction(classGroupId).then((result) => {
      if (!current) return;
      if (!result.ok) {
        toast.error("Não foi possível carregar as sessões.", {
          description: result.message,
        });
      }
      setLoaded({ classGroupId, sessions: result.ok ? result.sessions : [] });
    });
    return () => {
      current = false;
    };
  }, [classGroupId]);

  const sessions =
    loaded?.classGroupId === classGroupId
      ? // Só as que cabem no período e ainda têm vaga.
        loaded.sessions.filter(
          (item) =>
            item.date >= period.start &&
            item.date <= period.end &&
            item.cancelledAt === null &&
            item.available > 0,
        )
      : null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!classGroupId || !slot) {
      setError("Escolha a sessão da turma.");
      document.getElementById("replace-slot")?.focus();
      return;
    }
    const [date, time] = slot.split("|");
    startTransition(async () => {
      const result = await replaceInClassGroupAction(
        recurrenceId,
        session.id,
        classGroupId,
        date,
        time,
      );
      if (result.ok) {
        toast.success("Aula levada para a turma.", {
          description: `${shortDayLabel(date)} às ${time}`,
        });
        onDone();
        onOpenChange(false);
        return;
      }
      // Ex.: sessão lotada, cliente já nela, fora do período.
      setError(result.message);
      toast.error("Não foi possível repor na turma.", {
        description: result.message,
      });
    });
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Repor em turma</DialogTitle>
        <DialogDescription>
          A aula de {clientName} ({session.label}) vai para uma sessão de turma
          do mesmo serviço, com o profissional da turma, dentro do período.
        </DialogDescription>
      </DialogHeader>

      {classGroups.length > 1 && (
        <FormField id="replace-class" label="Turma" required>
          <ClassGroupSelect
            id="replace-class"
            classGroups={classGroups}
            value={classGroupId}
            onChange={(next) => {
              setClassGroupId(next);
              setSlot("");
              setError(undefined);
            }}
          />
        </FormField>
      )}

      <FormField id="replace-slot" label="Sessão" required error={error}>
        <Select
          value={slot || undefined}
          disabled={sessions === null}
          onValueChange={(next) => {
            setSlot(next);
            setError(undefined);
          }}
        >
          <SelectTrigger id="replace-slot" className="w-full">
            <SelectValue
              placeholder={
                sessions === null ? "Carregando sessões…" : "Escolha a sessão…"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {sessions?.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                Nenhuma sessão com vaga nas próximas 4 semanas.
              </p>
            )}
            {sessions?.map((item) => (
              <SelectItem
                key={`${item.date}|${item.time}`}
                value={`${item.date}|${item.time}`}
              >
                {shortDayLabel(item.date)} às {item.time} · {item.available}{" "}
                {item.available === 1 ? "vaga livre" : "vagas livres"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Button type="submit" disabled={pending}>
          <UsersRound aria-hidden="true" />
          {pending ? "Salvando…" : "Repor em turma"}
        </Button>
      </DialogFooter>
    </form>
  );
}
