import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/utils/format";
import type { ProfessionalCommission } from "@/types/professional-app";
import { dateOf } from "./professional-clients";
import { receiptNumber, ruleLabel } from "./professional-commissions";

/** Uma comissão da lista do mês: o atendimento, a conta e o valor. */
export function CommissionCard({
  item,
  timeZone,
}: {
  item: ProfessionalCommission;
  timeZone: string;
}) {
  return (
    <li className="space-y-1 rounded-card border border-border bg-card p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate font-semibold">{item.clientName}</p>
        <p className="shrink-0 font-semibold">{formatPrice(item.amount)}</p>
      </div>
      <p className="text-muted-foreground">
        {dateOf(item.startAt, timeZone)} · {item.serviceName}
      </p>
      <p className="text-muted-foreground">
        {ruleLabel(item)}
        {item.fromPackage && " · Sessão de pacote"}
      </p>
      <Badge variant="secondary">
        {item.closingNumber !== null
          ? `Fechamento nº ${receiptNumber(item.closingNumber)}`
          : "Em aberto"}
      </Badge>
    </li>
  );
}
