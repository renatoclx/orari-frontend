import Link from "next/link";
import { CalendarDays, CirclePlay, UsersRound } from "lucide-react";
import type { ProfessionalHome } from "@/types/professional-app";
import { timeOf } from "./professional-agenda";
import { attendanceCount } from "./professional-home";

/**
 * Hoje no Início: quantos atendimentos, quantos faltam e o próximo (ou o que
 * está em andamento). Leva à Agenda do dia.
 */
export function HomeToday({
  today,
  timeZone,
}: {
  today: ProfessionalHome["today"];
  timeZone: string;
}) {
  const { total, remaining, next } = today;
  return (
    <section className="space-y-3 rounded-card border border-border bg-card p-4">
      <div>
        <div>
          <h2 className="text-sm text-muted-foreground">Hoje</h2>
          <p className="text-2xl font-semibold">
            {total === 0 ? "Dia livre" : attendanceCount(total)}
          </p>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              {remaining === 0
                ? "Todos já foram atendidos"
                : remaining === 1
                  ? "Falta 1"
                  : `Faltam ${remaining}`}
            </p>
          )}
        </div>
      </div>

      {next && (
        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            {next.inProgress ? (
              <>
                <CirclePlay
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                Em andamento
              </>
            ) : (
              "Próximo"
            )}
          </p>
          <p className="font-semibold">
            {timeOf(next.startAt, timeZone)} – {timeOf(next.endAt, timeZone)} ·{" "}
            {next.isClass ? (
              <span className="inline-flex items-center gap-1">
                <UsersRound className="size-4" aria-hidden="true" />
                Turma
              </span>
            ) : (
              next.clientName
            )}
          </p>
          <p className="text-muted-foreground">{next.serviceName}</p>
        </div>
      )}

      {/* O botão ocupa a largura do card (regra dos botões do app). */}
      <Link
        href="/app/agenda"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-control border border-border text-base font-medium"
      >
        <CalendarDays className="size-5" aria-hidden="true" />
        Abrir a agenda
      </Link>
    </section>
  );
}
