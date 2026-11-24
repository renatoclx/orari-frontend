import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { appointmentWhen } from "@/components/client-app/client-app";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { formatPhone } from "@/utils/format";
import type { ProfessionalClient } from "@/types/professional-app";
import { dateOf } from "./professional-clients";

/** Um cliente na lista de Meus clientes: leva à ficha dele. */
export function ClientCard({
  client,
  timeZone,
}: {
  client: ProfessionalClient;
  timeZone: string;
}) {
  return (
    <li>
      <Link
        href={`/app/clientes/${client.id}`}
        className="flex items-center gap-3 rounded-card border border-border bg-card p-4"
      >
        <PersonAvatar name={client.name} photoUrl={client.photoUrl} size="lg" />
        <span className="min-w-0 flex-1 text-sm">
          <span className="block truncate font-semibold">{client.name}</span>
          {client.phone && (
            <span className="block text-muted-foreground">
              {formatPhone(client.phone)}
            </span>
          )}
          <span className="block truncate text-muted-foreground">
            {client.nextAt
              ? `Próximo: ${appointmentWhen(client.nextAt, timeZone)}`
              : client.lastCompleted
                ? `Último: ${dateOf(client.lastCompleted.startAt, timeZone)} · ${client.lastCompleted.serviceName}`
                : "Sem atendimento concluído"}
          </span>
        </span>
        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
