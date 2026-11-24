import { notFound } from "next/navigation";
import { HandCoins, Receipt, Wallet } from "lucide-react";
import { monthLongLabel } from "@/components/platform-dashboard/platform-format";
import {
  SummaryCardContent as Card,
  summaryCardClass,
} from "@/components/shared/SummaryCard";
import { PaymentsList } from "@/components/subscription-payments/PaymentsList";
import { PaymentsToolbar } from "@/components/subscription-payments/PaymentsToolbar";
import { getCurrentUser } from "@/services/auth.service";
import { listPaymentsByMonth } from "@/services/subscription-payment.service";
import { listSubscriptions } from "@/services/subscription.service";
import { formatPrice } from "@/utils/format";

/** Fuso da plataforma: o mês atual, o mesmo da API. */
const PLATFORM_TIME_ZONE = "America/Sao_Paulo";

/**
 * Cobranças (screens/cobrancas.md), só do SUPER_ADMIN: os pagamentos das
 * assinaturas de um mês (?mes=aaaa-mm), o total recebido e o registro de
 * novos. Renderizada no servidor.
 */
export async function PaymentsListPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await getCurrentUser();
  if (user.type !== "SUPER_ADMIN") notFound();

  const current = new Intl.DateTimeFormat("en-CA", {
    timeZone: PLATFORM_TIME_ZONE,
  })
    .format(new Date())
    .slice(0, 7);
  const asked = typeof searchParams.mes === "string" ? searchParams.mes : "";
  // Mês inválido na URL: vale o atual.
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(asked) ? asked : current;

  const [payments, subscriptions] = await Promise.all([
    listPaymentsByMonth(month),
    listSubscriptions(),
  ]);
  // Só quem tem assinatura pode receber pagamento.
  const companies = subscriptions
    .filter((item) => item.subscription !== null)
    .map((item) => ({ id: item.companyId, name: item.companyName }));
  const average = payments.count > 0 ? payments.total / payments.count : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Cobranças</h1>
        <p className="text-sm text-muted-foreground">
          Pagamentos recebidos em{" "}
          <span className="first-letter:uppercase">
            {monthLongLabel(month)}
          </span>
          .
        </p>
      </div>

      <PaymentsToolbar month={month} current={current} companies={companies} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={summaryCardClass}>
          <Card
            icon={Wallet}
            label="Recebido no mês"
            value={formatPrice(payments.total)}
            detail={
              payments.count === 1
                ? "1 pagamento"
                : `${payments.count} pagamentos`
            }
            tone="positive"
          />
        </div>
        <div className={summaryCardClass}>
          <Card
            icon={Receipt}
            label="Média por pagamento"
            value={payments.count > 0 ? formatPrice(average) : "--"}
            detail="por pagamento"
            tone="neutral"
          />
        </div>
        <div className={summaryCardClass}>
          <Card
            icon={HandCoins}
            label="Empresas que pagaram"
            value={new Set(payments.items.map((item) => item.companyId)).size}
            detail={`de ${companies.length} com assinatura`}
            tone="neutral"
          />
        </div>
      </div>

      <PaymentsList items={payments.items} />
    </div>
  );
}
