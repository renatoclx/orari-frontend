import Link from "next/link";
import type { ProfessionalHome } from "@/types/professional-app";
import {
  attendanceCount,
  weekBars,
  weekDescription,
  weekTotal,
} from "./professional-home";

// Altura da área das barras; a barra cheia ocupa ela toda.
const CHART_HEIGHT = 96;

/**
 * Gráfico da semana (segunda a domingo): atendimentos por dia, com o número
 * sobre cada barra. O que já passou vai em cor cheia, o que ainda vai
 * acontecer em tom claro e hoje fica destacado. Cada barra leva à Agenda
 * daquele dia. Uma série só, na cor primária; sem biblioteca de gráfico.
 */
export function HomeWeekChart({
  week,
  today,
}: {
  week: ProfessionalHome["week"];
  today: string;
}) {
  const bars = weekBars(week, today);
  return (
    <section className="space-y-3 rounded-card border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm text-muted-foreground">Esta semana</h2>
        <p className="text-sm font-medium">
          {attendanceCount(weekTotal(week))}
        </p>
      </div>

      {/* O gráfico é decorativo para quem usa leitor de tela: a descrição em texto o substitui. */}
      <p className="sr-only">Atendimentos por dia: {weekDescription(bars)}.</p>
      <ul className="grid grid-cols-7 gap-2" aria-hidden="true">
        {bars.map((bar) => (
          <li key={bar.date}>
            <Link
              href={
                bar.state === "today"
                  ? "/app/agenda"
                  : `/app/agenda?dia=${bar.date}`
              }
              tabIndex={-1}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-xs font-semibold tabular-nums">
                {bar.count}
              </span>
              <span
                className="flex w-full items-end"
                style={{ height: CHART_HEIGHT }}
              >
                <span
                  className={`w-full rounded-t-sm ${
                    bar.count === 0
                      ? "bg-muted"
                      : bar.state === "future"
                        ? "bg-primary/35"
                        : "bg-primary"
                  }`}
                  style={{
                    // O dia vazio tem só uma marca fina, para a coluna não sumir.
                    height: bar.count === 0 ? 4 : `${Math.max(bar.height, 8)}%`,
                  }}
                />
              </span>
              <span
                className={`text-xs ${
                  bar.state === "today"
                    ? "font-bold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {bar.weekday}
              </span>
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs tabular-nums ${
                  bar.state === "today"
                    ? "bg-primary font-bold text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {bar.day}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary" aria-hidden="true" />
          Já passou
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm bg-primary/35"
            aria-hidden="true"
          />
          Agendado
        </span>
      </p>
    </section>
  );
}
