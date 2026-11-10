import { MessageCircle } from "lucide-react";
import { sessionsText } from "@/components/packages-report/packages-report-filters";
import { whatsAppLink } from "@/components/portal-access/portal-access";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { Button } from "@/components/ui/button";
import type { EndingContract } from "@/types/packages-report";
import { formatDateOnly } from "@/utils/format";

/** "30/11/2026" a partir da data de calendário. */
export const endDay = (date: string) => formatDateOnly(`${date}T00:00:00Z`);

/**
 * Contratações terminando em até 30 dias, sem renovação
 * (screens/relatorio-pacotes.md), do fim mais próximo.
 */
export function EndingContractList({
  contracts,
  footer,
}: {
  contracts: EndingContract[];
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
}) {
  // Abre a conversa no WhatsApp da clínica; o Orari não envia nada.
  function whatsApp(contract: EndingContract) {
    if (!contract.client.phone) return null;
    const firstName = contract.client.name.trim().split(/\s+/)[0];
    return (
      <Hint label="Chamar no WhatsApp">
        <Button variant="ghost" size="icon" asChild>
          <a
            href={whatsAppLink(contract.client.phone, `Olá, ${firstName}!`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chamar ${contract.client.name} no WhatsApp`}
          >
            <MessageCircle aria-hidden="true" />
          </a>
        </Button>
      </Hint>
    );
  }

  const person = (contract: EndingContract) => (
    <div className="flex items-center gap-3">
      <PersonAvatar
        name={contract.client.name}
        photoUrl={contract.client.photoUrl}
      />
      <span className="font-medium">{contract.client.name}</span>
    </div>
  );

  return (
    <ListCard
      toolbar={
        <h2 className="border-b border-border px-4 py-3 font-semibold">
          Terminando em 30 dias
        </h2>
      }
      // Sem celular, a linha não tem nada clicável: a área precisa de foco.
      scrollLabel="Contratações terminando"
      columns={[
        "Cliente",
        "Pacote",
        "Termina em",
        "Sessões concluídas",
        { key: "Ações", header: <span className="sr-only">Ações</span> },
      ]}
      emptyMessage={
        contracts.length > 0
          ? undefined
          : "Nenhuma contratação terminando nos próximos 30 dias sem renovação."
      }
      rows={contracts.map((contract) => (
        <tr key={contract.id} className="tabular-nums hover:bg-background">
          <td className="px-4 py-3">{person(contract)}</td>
          <td className="px-4 py-3">{contract.plan.name}</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {endDay(contract.endDate)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            {sessionsText(contract.sessions)}
          </td>
          <td className="px-4 py-2">{whatsApp(contract)}</td>
        </tr>
      ))}
      cards={contracts.map((contract) => (
        <li key={contract.id} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            {person(contract)}
            {whatsApp(contract)}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm tabular-nums">
            <dt className="text-muted-foreground">Pacote</dt>
            <dd>{contract.plan.name}</dd>
            <dt className="text-muted-foreground">Termina em</dt>
            <dd>{endDay(contract.endDate)}</dd>
            <dt className="text-muted-foreground">Sessões concluídas</dt>
            <dd>{sessionsText(contract.sessions)}</dd>
          </dl>
        </li>
      ))}
      footer={footer}
    />
  );
}
