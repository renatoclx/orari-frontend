import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Package,
  Phone,
  Repeat,
  UsersRound,
} from "lucide-react";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
import { appointmentWhen } from "@/components/client-app/client-app";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { getProfessionalMe } from "@/services/app-pro.service";
import type { ProfessionalClientDetail } from "@/types/professional-app";
import { formatDuration, formatPhone, formatPrice } from "@/utils/format";
import { ORIGIN_LABEL, originOf, timeOf } from "./professional-agenda";
import { dateOf, telUrl, whatsappUrl } from "./professional-clients";

const ACTION =
  "flex h-12 flex-1 items-center justify-center gap-2 rounded-control text-sm font-medium";

/**
 * Ficha do cliente no app do profissional (screens/app-profissional.md): contato
 * com Ligar e WhatsApp, último e próximo atendimento e o histórico dos
 * atendimentos dele com o cliente. Sem pagamento. Só consulta.
 */
export async function ProfessionalClientDetailView({
  client,
}: {
  client: ProfessionalClientDetail;
}) {
  const { company } = await getProfessionalMe();
  const timeZone = company.timezone;
  const tel = telUrl(client.phone);
  const whatsapp = whatsappUrl(client.phone);

  return (
    <>
      <Link
        href="/app/clientes"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Clientes
      </Link>

      <header className="flex items-center gap-4">
        <PersonAvatar name={client.name} photoUrl={client.photoUrl} size="lg" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">{client.name}</h1>
          <p className="text-sm text-muted-foreground">
            {client.phone
              ? formatPhone(client.phone)
              : "Sem telefone cadastrado"}
          </p>
        </div>
      </header>

      {tel && whatsapp && (
        <div className="flex gap-2">
          <a
            href={tel}
            className={`${ACTION} bg-primary text-primary-foreground`}
          >
            <Phone className="size-4" aria-hidden="true" />
            Ligar
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ACTION} border border-border bg-card`}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      )}

      <section className="space-y-1 rounded-card border border-border bg-card p-4 text-sm">
        <p>
          <span className="text-muted-foreground">Último atendimento: </span>
          {client.lastCompleted
            ? `${dateOf(client.lastCompleted.startAt, timeZone)} · ${client.lastCompleted.serviceName}`
            : "nenhum concluído"}
        </p>
        <p>
          <span className="text-muted-foreground">Próximo: </span>
          {client.nextAt
            ? appointmentWhen(client.nextAt, timeZone)
            : "nada marcado"}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Atendimentos</h2>
        <ul className="space-y-2">
          {client.history.map((item) => {
            const status = APPOINTMENT_STATUS[item.status];
            const origin = originOf(item);
            const faded = ["CANCELLED", "NO_SHOW"].includes(item.status);
            return (
              <li
                key={item.id}
                className={`space-y-1 rounded-card border border-border bg-card p-4 text-sm ${
                  faded ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">
                    {dateOf(item.startAt, timeZone)} ·{" "}
                    {timeOf(item.startAt, timeZone)}
                  </p>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <status.icon className="size-4" aria-hidden="true" />
                    {status.label}
                  </span>
                </div>
                <p>
                  {item.service.name}
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatDuration(item.service.duration)}
                    {item.service.price !== null &&
                      ` · ${formatPrice(item.service.price)}`}
                  </span>
                </p>
                {(origin || item.inClass) && (
                  <div className="flex flex-wrap gap-2">
                    {item.inClass && (
                      <Badge variant="secondary">
                        <UsersRound className="size-3" aria-hidden="true" />
                        Turma
                      </Badge>
                    )}
                    {origin && (
                      <Badge variant="secondary">
                        {origin === "package" && (
                          <Package className="size-3" aria-hidden="true" />
                        )}
                        {origin === "recurring" && (
                          <Repeat className="size-3" aria-hidden="true" />
                        )}
                        {ORIGIN_LABEL[origin]}
                      </Badge>
                    )}
                  </div>
                )}
                {item.note && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Observação:{" "}
                    </span>
                    {item.note}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
