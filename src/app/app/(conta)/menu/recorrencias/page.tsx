import type { Metadata } from "next";
import { Repeat } from "lucide-react";
import { MenuSubpageHeader } from "@/components/client-app/MenuSubpageHeader";
import {
  daysLabel,
  periodLabel,
  recurrenceKindLabel,
} from "@/components/client-app/agreements";
import { Badge } from "@/components/ui/badge";
import { listRecurrences } from "@/services/app-profile.service";

export const metadata: Metadata = { title: "Recorrências" };

/**
 * Menu → Recorrências (screens/app-cliente.md): os horários fixos, de pacote e
 * de turma em vigor, em todos os estabelecimentos, só para ver.
 */
export default async function AppRecurrencesPage() {
  const recurrences = await listRecurrences();
  return (
    <>
      <MenuSubpageHeader
        title="Recorrências"
        description="Seus horários fixos e turmas. Para mudar, fale com o estabelecimento."
      />
      {recurrences.length > 0 ? (
        <ul className="space-y-3">
          {recurrences.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-card border border-border bg-card p-4"
            >
              <Repeat
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 space-y-0.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{item.service.name}</p>
                  <Badge variant="secondary">
                    {recurrenceKindLabel(item.kind)}
                  </Badge>
                </div>
                {daysLabel(item.days).map((line) => (
                  <p key={line} className="font-medium">
                    {line}
                  </p>
                ))}
                <p className="text-muted-foreground">
                  {item.professional.name} · {item.place.name}
                </p>
                <p className="text-muted-foreground">
                  {periodLabel(item.startDate, item.endDate)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
          Você não tem horários fixos nem turmas.
        </p>
      )}
    </>
  );
}
