"use client";

import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfessionalClassSession } from "@/types/class-group";

type ClassSessionTimesProps = {
  sessions: ProfessionalClassSession[];
  /** Horário escolhido ("HH:mm") ou vazio. */
  value: string;
  onChange: (time: string) => void;
};

/**
 * Horários de turma do profissional no dia, como opção do encaixe: o
 * atendimento é marcado à parte, dividindo o horário com a turma (sem ocupar
 * vaga dela). Dois botões de turma no mesmo horário viram um só.
 */
export function ClassSessionTimes({
  sessions,
  value,
  onChange,
}: ClassSessionTimesProps) {
  const selected = sessions.find((session) => session.time === value);

  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-label="Horários de turma"
        className="grid grid-cols-2 gap-2"
      >
        {sessions.map((session) => {
          const marked = session.time === value;
          return (
            <Button
              key={`${session.time}-${session.label}`}
              type="button"
              variant={marked ? "default" : "outline"}
              aria-pressed={marked}
              onClick={() => onChange(session.time)}
              className="h-auto min-w-0 flex-col gap-0 py-1.5 tabular-nums"
            >
              <span>{session.time}</span>
              <span className="max-w-full truncate text-xs font-normal opacity-80">
                {session.label} · {session.occupied}/{session.capacity}
              </span>
            </Button>
          );
        })}
      </div>

      {selected && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-control border border-border bg-muted px-3 py-2 text-sm"
        >
          <UsersRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Este horário pertence à turma <strong>{selected.label}</strong>. O
            atendimento ocorrerá durante o horário da turma.
          </span>
        </p>
      )}
    </div>
  );
}
