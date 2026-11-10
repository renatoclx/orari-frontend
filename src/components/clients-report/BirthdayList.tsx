import { MessageCircle } from "lucide-react";
import { whatsAppLink } from "@/components/portal-access/portal-access";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { Button } from "@/components/ui/button";
import type { BirthdayClient } from "@/types/clients-report";
import { formatDateOnly } from "@/utils/format";

/** "20/11" a partir de "2026-11-20". */
export const dayMonth = (date: string) =>
  `${date.slice(8, 10)}/${date.slice(5, 7)}`;
/** "20/11/1990". */
export const fullDate = (date: string) => formatDateOnly(`${date}T00:00:00Z`);

/** Aniversariantes do período (screens/relatorio-perfil-cliente.md). */
export function BirthdayList({
  clients,
  footer,
}: {
  clients: BirthdayClient[];
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
}) {
  // Abre a conversa no WhatsApp da clínica, com os parabéns prontos.
  function whatsApp(client: BirthdayClient) {
    if (!client.phone) return null;
    const firstName = client.name.trim().split(/\s+/)[0];
    return (
      <Hint label="Dar os parabéns no WhatsApp">
        <Button variant="ghost" size="icon" asChild>
          <a
            href={whatsAppLink(
              client.phone,
              `Feliz aniversário, ${firstName}!`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Dar os parabéns a ${client.name} no WhatsApp`}
          >
            <MessageCircle aria-hidden="true" />
          </a>
        </Button>
      </Hint>
    );
  }

  const person = (client: BirthdayClient) => (
    <div className="flex items-center gap-3">
      <PersonAvatar name={client.name} photoUrl={client.photoUrl} />
      <span className="font-medium">{client.name}</span>
    </div>
  );

  return (
    <ListCard
      toolbar={
        <h2 className="border-b border-border px-4 py-3 font-semibold">
          Aniversariantes do período
        </h2>
      }
      // Sem celular, a linha não tem nada clicável: a área precisa de foco.
      scrollLabel="Aniversariantes"
      columns={[
        "Cliente",
        "Aniversário",
        "Completa",
        "Nascimento",
        { key: "Ações", header: <span className="sr-only">Ações</span> },
      ]}
      emptyMessage={
        clients.length > 0
          ? undefined
          : "Nenhum aniversariante no período entre os clientes com data de nascimento."
      }
      rows={clients.map((client) => (
        <tr key={client.id} className="tabular-nums hover:bg-background">
          <td className="px-4 py-3">{person(client)}</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {dayMonth(client.birthday)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">{client.turning} anos</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {fullDate(client.birthDate)}
          </td>
          <td className="px-4 py-2">{whatsApp(client)}</td>
        </tr>
      ))}
      cards={clients.map((client) => (
        <li key={client.id} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            {person(client)}
            {whatsApp(client)}
          </div>
          <p className="text-sm tabular-nums">
            {dayMonth(client.birthday)} · completa {client.turning} anos
          </p>
        </li>
      ))}
      footer={footer}
    />
  );
}
