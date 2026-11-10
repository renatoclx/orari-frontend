import { clientPaidStatus } from "@/components/commissions/commission-filters";
import { ListCard } from "@/components/shared/ListCard";
import type { CommissionItem } from "@/types/commission";
import { formatDateOnly, formatPrice } from "@/utils/format";
import { toDateString } from "@/utils/time";

type CommissionListProps = {
  items: CommissionItem[];
  /** Fuso da empresa: a data é o dia do atendimento nele. */
  timeZone: string;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
  /** Abas do quadro (Atendimentos | Adiantamentos). */
  tabs: React.ReactNode;
};

/** "40%" ou "R$ 15,00 fixo": a regra gravada na comissão. */
const ruleText = (item: CommissionItem) =>
  item.type === "PERCENT"
    ? `${String(Number(item.rate)).replace(".", ",")}%`
    : `${formatPrice(item.rate)} fixo`;

/** Atendimentos de um profissional com a comissão de cada um. */
export function CommissionList({
  items,
  timeZone,
  footer,
  tabs,
}: CommissionListProps) {
  const day = (item: CommissionItem) =>
    formatDateOnly(
      `${toDateString(new Date(item.appointment.startAt), timeZone)}T00:00:00Z`,
    );
  const service = (item: CommissionItem) =>
    `${item.appointment.service.name}${item.appointment.fromPackage ? " (pacote)" : ""}`;
  // Situação em texto, sem cor: o valor pago vem junto quando é parcial.
  const paid = (item: CommissionItem) => {
    const status = clientPaidStatus(item.baseAmount, item.clientPaid);
    return status === "Parcial"
      ? `Parcial (${formatPrice(item.clientPaid)})`
      : status;
  };

  return (
    <ListCard
      toolbar={tabs}
      // Sem nada clicável nas linhas: a área com rolagem recebe foco.
      scrollLabel="Comissões por atendimento"
      columns={[
        "Data",
        "Cliente",
        "Serviço",
        "Base",
        "Regra",
        "Comissão",
        "Cliente pagou",
      ]}
      emptyMessage={
        items.length > 0
          ? undefined
          : "Nenhuma comissão deste profissional no período."
      }
      rows={items.map((item) => (
        <tr key={item.id} className="tabular-nums hover:bg-background">
          <td className="px-4 py-3 whitespace-nowrap">{day(item)}</td>
          <td className="px-4 py-3 font-medium">
            {item.appointment.client.name}
          </td>
          <td className="px-4 py-3">{service(item)}</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {formatPrice(item.baseAmount)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">{ruleText(item)}</td>
          <td className="px-4 py-3 font-medium whitespace-nowrap">
            {formatPrice(item.amount)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">{paid(item)}</td>
        </tr>
      ))}
      cards={items.map((item) => (
        <li key={item.id} className="space-y-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium">{item.appointment.client.name}</span>
            <span className="font-semibold whitespace-nowrap tabular-nums">
              {formatPrice(item.amount)}
            </span>
          </div>
          <p className="text-sm">
            {service(item)} · {ruleText(item)} de {formatPrice(item.baseAmount)}
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {day(item)} · Cliente: {paid(item)}
          </p>
        </li>
      ))}
      footer={footer}
    />
  );
}
