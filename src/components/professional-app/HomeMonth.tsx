import { monthLabel } from "./professional-commissions";
import { comparison } from "./professional-home";
import type { ProfessionalHome } from "@/types/professional-app";

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: { text: string; tone: "up" | "down" | "same" };
}) {
  return (
    <div className="space-y-1 rounded-card border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {note && (
        <p
          className={`text-xs ${
            note.tone === "up"
              ? "text-success"
              : note.tone === "down"
                ? "text-destructive"
                : "text-muted-foreground"
          }`}
        >
          {note.text}
        </p>
      )}
    </div>
  );
}

/**
 * O mês no Início: concluídos (com a comparação ao mês anterior), clientes
 * atendidos, faltas e cancelados. Faltas e cancelamentos contam marcações.
 */
export function HomeMonth({ month }: { month: ProfessionalHome["month"] }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm text-muted-foreground">
        {monthLabel(month.month)}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <Stat
          label="Concluídos"
          value={month.completed}
          // Sem concluídos no mês anterior, comparar não diz nada.
          note={
            month.previousCompleted > 0
              ? comparison(month.completed, month.previousCompleted)
              : undefined
          }
        />
        <Stat label="Clientes atendidos" value={month.clients} />
        <Stat label="Faltas" value={month.noShow} />
        <Stat label="Cancelados" value={month.cancelled} />
      </div>
    </section>
  );
}
