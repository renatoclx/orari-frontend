import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";
import { PORTFOLIO_STATUS_BADGES } from "@/components/client-portfolio/portfolio-filters";
import { whatsAppLink } from "@/components/portal-access/portal-access";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PortfolioClient } from "@/types/client-portfolio";
import { formatDateOnly, formatPrice } from "@/utils/format";
import { toDateString, toTimeString } from "@/utils/time";

type PortfolioClientListProps = {
  clients: PortfolioClient[];
  /** Há filtro de situação ou busca: muda a mensagem de lista vazia. */
  filtered: boolean;
  timeZone: string;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

// Data no fuso da empresa ("12/10/2026").
function dateLabel(iso: string, timeZone: string) {
  return formatDateOnly(`${toDateString(new Date(iso), timeZone)}T00:00:00Z`);
}

/** Clientes da carteira (screens/carteira-clientes.md), quem precisa de contato primeiro. */
export function PortfolioClientList({
  clients,
  filtered,
  timeZone,
  footer,
}: PortfolioClientListProps) {
  const last = (client: PortfolioClient) =>
    client.lastCompleted && (
      <>
        <span className="block">
          {dateLabel(client.lastCompleted.startAt, timeZone)}
        </span>
        <span className="block text-muted-foreground">
          {client.lastCompleted.serviceName}
        </span>
      </>
    );
  const next = (client: PortfolioClient) =>
    client.nextAt &&
    `${dateLabel(client.nextAt, timeZone)} às ${toTimeString(client.nextAt, timeZone)}`;
  const badge = (client: PortfolioClient) => {
    const { label, variant } = PORTFOLIO_STATUS_BADGES[client.status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  function actions(client: PortfolioClient) {
    const firstName = client.name.trim().split(/\s+/)[0];
    return (
      <div className="flex items-center gap-1">
        <Hint label="Visualizar histórico">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/clientes/${client.id}`}
              aria-label={`Visualizar histórico de ${client.name}`}
            >
              <Eye aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
        {/* Abre a conversa no WhatsApp da clínica; o Orari não envia nada. */}
        {client.phone && (
          <Hint label="Chamar no WhatsApp">
            <Button variant="ghost" size="icon" asChild>
              <a
                href={whatsAppLink(client.phone, `Olá, ${firstName}!`)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chamar ${client.name} no WhatsApp`}
              >
                <MessageCircle aria-hidden="true" />
              </a>
            </Button>
          </Hint>
        )}
      </div>
    );
  }

  const person = (client: PortfolioClient) => (
    <div className="flex items-center gap-3">
      <PersonAvatar name={client.name} photoUrl={client.photoUrl} />
      <span className="font-medium">{client.name}</span>
    </div>
  );

  return (
    <ListCard
      columns={[
        "Cliente",
        "Situação",
        "Último atendimento",
        "Próximo agendamento",
        "No período",
        "Pendente",
        { key: "Ações", header: <span className="sr-only">Ações</span> },
      ]}
      emptyMessage={
        clients.length > 0
          ? undefined
          : filtered
            ? "Nenhum cliente encontrado para os filtros escolhidos."
            : "Nenhum cliente na carteira deste profissional ainda."
      }
      rows={clients.map((client) => (
        <tr key={client.id} className="tabular-nums hover:bg-background">
          <td className="px-4 py-3">{person(client)}</td>
          <td className="px-4 py-3">{badge(client)}</td>
          <td className="px-4 py-3">
            <EmptyValue>{last(client)}</EmptyValue>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <EmptyValue>{next(client)}</EmptyValue>
          </td>
          <td className="px-4 py-3">{client.completedInPeriod}</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {Number(client.pending) > 0 ? formatPrice(client.pending) : "--"}
          </td>
          <td className="px-4 py-2">{actions(client)}</td>
        </tr>
      ))}
      cards={clients.map((client) => (
        <li key={client.id} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            {person(client)}
            {badge(client)}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm tabular-nums">
            <dt className="text-muted-foreground">Último</dt>
            <dd>
              <EmptyValue>
                {client.lastCompleted &&
                  `${dateLabel(client.lastCompleted.startAt, timeZone)}, ${client.lastCompleted.serviceName}`}
              </EmptyValue>
            </dd>
            <dt className="text-muted-foreground">Próximo</dt>
            <dd>
              <EmptyValue>{next(client)}</EmptyValue>
            </dd>
            <dt className="text-muted-foreground">Pendente</dt>
            <dd>
              {Number(client.pending) > 0 ? formatPrice(client.pending) : "--"}
            </dd>
          </dl>
          {actions(client)}
        </li>
      ))}
      footer={footer}
    />
  );
}
