import { Clock, UserRound, UsersRound } from "lucide-react";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
import type { AgendaClassSession } from "@/components/agenda/class-session-blocks";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatDuration } from "@/utils/format";

type ClassSessionBlockProps = {
  session: AgendaClassSession;
  top: number;
  height: number;
  /** Clique (ou Enter) no bloco: abre a sessão (vagas e alunos). */
  onSelect?: (session: AgendaClassSession) => void;
};

/**
 * Bloco de uma sessão de turma na grade: um só para todos os alunos, com o
 * serviço, as vagas ocupadas ("3/5") e os nomes. Mesmo desenho do bloco do
 * agendamento; o cartão ao passar o mouse lista os alunos com a situação.
 */
export function ClassSessionBlock({
  session,
  top,
  height,
  onSelect,
}: ClassSessionBlockProps) {
  const { serviceColor } = session;
  // Sem aluno ocupando vaga (todos cancelados): esmaecida, como o cancelado.
  const faded = session.occupied === 0;
  const active = session.members.filter((m) => m.status !== "CANCELLED");
  const spots = `${session.occupied}/${session.capacity}`;

  return (
    <HoverCard openDelay={250} closeDelay={80}>
      <HoverCardTrigger asChild>
        <div
          // Focável para o cartão também abrir pelo teclado.
          tabIndex={0}
          role="button"
          onClick={() => onSelect?.(session)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              // Espaço rolaria a grade: aqui ele abre, como num botão.
              event.preventDefault();
              onSelect?.(session);
            }
          }}
          aria-label={`${session.start} turma de ${session.serviceName}, das ${session.start} às ${session.end}, com ${session.professionalName}. ${session.occupied} de ${session.capacity} vagas ocupadas.`}
          className={`absolute inset-x-1 z-1 cursor-pointer overflow-hidden rounded-control border-l-[3px] py-1 pr-3 pl-2 ${
            faded ? "text-muted-foreground" : ""
          }`}
          style={{
            top,
            height,
            borderLeftColor: faded
              ? `color-mix(in srgb, ${serviceColor} 55%, transparent)`
              : serviceColor,
            backgroundColor: `color-mix(in srgb, ${serviceColor} ${faded ? 8 : 16}%, transparent)`,
          }}
        >
          <div className="mb-0.5 flex items-center gap-1.5">
            <time className="text-xs text-muted-foreground tabular-nums">
              {session.start}
            </time>
            <h3 className="truncate text-sm font-medium">
              {session.serviceName}
            </h3>
            {/* Vagas ocupadas por escrito, no lugar da situação do agendamento. */}
            <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <UsersRound className="size-4 shrink-0" aria-hidden="true" />
              {spots}
            </span>
          </div>
          {/* "Turma" com o mesmo peso da origem no bloco do agendamento, e os alunos. */}
          <p className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="font-medium">Turma</span>
              <span aria-hidden="true">-</span>
            </span>
            <span className="truncate">
              {active.length > 0
                ? active.map((m) => m.clientName.split(" ")[0]).join(", ")
                : "Sem alunos"}
            </span>
          </p>
        </div>
      </HoverCardTrigger>

      <HoverCardContent side="right" align="start" collisionPadding={16}>
        <p className="flex items-center gap-1.5 font-semibold">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: serviceColor }}
            aria-hidden="true"
          />
          <span className="truncate">
            Turma de {session.serviceName} ·{" "}
            {formatDuration(session.durationMinutes)}
          </span>
        </p>

        <ul className="mt-3 space-y-2 border-t border-border pt-3 text-muted-foreground">
          <li className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">
              {session.start} às {session.end}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <UserRound className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">com {session.professionalName}</span>
          </li>
          <li className="flex items-center gap-2">
            <UsersRound className="size-4 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">
              {session.occupied} de {session.capacity} vagas ocupadas
            </span>
          </li>
        </ul>

        <ul className="mt-3 space-y-1 border-t border-border pt-3">
          {session.members.map((member) => {
            const { label, icon: StatusIcon } =
              APPOINTMENT_STATUS[member.status];
            return (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3"
              >
                <span
                  className={`truncate ${member.status === "CANCELLED" ? "text-muted-foreground line-through" : ""}`}
                >
                  {member.clientName}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <StatusIcon className="size-4" aria-hidden="true" />
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
