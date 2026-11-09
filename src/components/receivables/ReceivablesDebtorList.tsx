import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";
import { whatsAppLink } from "@/components/portal-access/portal-access";
import { overduePaymentsHref } from "@/components/receivables/receivables-filters";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { Button } from "@/components/ui/button";
import type { ReceivablesDebtor } from "@/types/receivables";
import { formatDateOnly, formatPrice } from "@/utils/format";

type ReceivablesDebtorListProps = {
  debtors: ReceivablesDebtor[];
  /** Há busca: muda a mensagem de lista vazia. */
  filtered: boolean;
  /** Hoje no fuso da empresa ("aaaa-mm-dd"), para contar os dias de atraso. */
  today: string;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Clientes com atraso (screens/contas-a-receber.md), maior valor primeiro. */
export function ReceivablesDebtorList({
  debtors,
  filtered,
  today,
  footer,
}: ReceivablesDebtorListProps) {
  // "10/09/2026 (há 66 dias)": as duas datas são de calendário.
  const oldest = (debtor: ReceivablesDebtor) => {
    const days = Math.round(
      (Date.parse(`${today}T00:00:00Z`) -
        Date.parse(`${debtor.oldestDueDate}T00:00:00Z`)) /
        DAY_MS,
    );
    return (
      <>
        {formatDateOnly(`${debtor.oldestDueDate}T00:00:00Z`)}{" "}
        <span className="text-muted-foreground">
          (há {days} {days === 1 ? "dia" : "dias"})
        </span>
      </>
    );
  };
  const payments = (debtor: ReceivablesDebtor) =>
    `${debtor.count} ${debtor.count === 1 ? "pagamento" : "pagamentos"}`;

  function actions(debtor: ReceivablesDebtor) {
    const firstName = debtor.name.trim().split(/\s+/)[0];
    return (
      <div className="flex items-center gap-1">
        <Hint label="Ver pagamentos atrasados">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={overduePaymentsHref(debtor.id)}
              aria-label={`Ver pagamentos atrasados de ${debtor.name}`}
            >
              <Eye aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
        {/* Abre a conversa no WhatsApp da clínica; o Orari não envia nada. */}
        {debtor.phone && (
          <Hint label="Chamar no WhatsApp">
            <Button variant="ghost" size="icon" asChild>
              <a
                href={whatsAppLink(debtor.phone, `Olá, ${firstName}!`)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chamar ${debtor.name} no WhatsApp`}
              >
                <MessageCircle aria-hidden="true" />
              </a>
            </Button>
          </Hint>
        )}
      </div>
    );
  }

  const person = (debtor: ReceivablesDebtor) => (
    <div className="flex items-center gap-3">
      <PersonAvatar name={debtor.name} photoUrl={debtor.photoUrl} />
      <span className="font-medium">{debtor.name}</span>
    </div>
  );

  return (
    <ListCard
      columns={[
        "Cliente",
        "Em atraso",
        "Pagamentos",
        "Vencimento mais antigo",
        { key: "Ações", header: <span className="sr-only">Ações</span> },
      ]}
      emptyMessage={
        debtors.length > 0
          ? undefined
          : filtered
            ? "Nenhum cliente com atraso encontrado para a busca."
            : "Nenhum cliente com pagamento atrasado."
      }
      rows={debtors.map((debtor) => (
        <tr key={debtor.id} className="tabular-nums hover:bg-background">
          <td className="px-4 py-3">{person(debtor)}</td>
          <td className="px-4 py-3 font-medium whitespace-nowrap text-destructive dark:text-red-400">
            {formatPrice(debtor.overdue)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">{payments(debtor)}</td>
          <td className="px-4 py-3 whitespace-nowrap">{oldest(debtor)}</td>
          <td className="px-4 py-2">{actions(debtor)}</td>
        </tr>
      ))}
      cards={debtors.map((debtor) => (
        <li key={debtor.id} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            {person(debtor)}
            <span className="font-semibold whitespace-nowrap text-destructive tabular-nums dark:text-red-400">
              {formatPrice(debtor.overdue)}
            </span>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm tabular-nums">
            <dt className="text-muted-foreground">Pagamentos</dt>
            <dd>{payments(debtor)}</dd>
            <dt className="text-muted-foreground">Mais antigo</dt>
            <dd>{oldest(debtor)}</dd>
          </dl>
          {actions(debtor)}
        </li>
      ))}
      footer={footer}
    />
  );
}
