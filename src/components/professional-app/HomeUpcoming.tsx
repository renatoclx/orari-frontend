import Link from "next/link";
import { appointmentWhen } from "@/components/client-app/client-app";
import { UsersRound } from "lucide-react";
import type { ProfessionalHome } from "@/types/professional-app";

/** Os próximos agendamentos depois de hoje; cada um leva à Agenda do dia. */
export function HomeUpcoming({
  items,
  timeZone,
}: {
  items: ProfessionalHome["upcoming"];
  timeZone: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-sm text-muted-foreground">Próximos agendamentos</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.startAt}>
            <Link
              href={`/app/agenda?dia=${new Intl.DateTimeFormat("sv-SE", { timeZone }).format(new Date(item.startAt))}`}
              className="block space-y-0.5 rounded-card border border-border bg-card p-4 text-sm"
            >
              <span className="block font-semibold">
                {appointmentWhen(item.startAt, timeZone)}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {item.isClass ? (
                  <>
                    <UsersRound className="size-4" aria-hidden="true" />
                    Turma
                  </>
                ) : (
                  item.clientName
                )}{" "}
                · {item.serviceName}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
