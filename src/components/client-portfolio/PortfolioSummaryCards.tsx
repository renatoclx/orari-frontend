import Link from "next/link";
import { CircleCheck, UserPlus, UserX, Users } from "lucide-react";
import {
  DEFAULT_STATUS_FILTER,
  PORTFOLIO_PATH,
  portfolioQuery,
  type PortfolioFiltersState,
} from "@/components/client-portfolio/portfolio-filters";
import type { PortfolioSummary } from "@/types/client-portfolio";
import { formatPrice } from "@/utils/format";
import { cn } from "cn";

type PortfolioSummaryCardsProps = {
  summary: PortfolioSummary;
  filters: PortfolioFiltersState;
  month: { from: string; to: string };
};

// Mesmo desenho dos cartões de Pagamentos (PaymentsSummary): faixa à
// esquerda, ícone em círculo tingido e o valor grande.
const cardClass =
  "relative flex items-center gap-3 overflow-hidden rounded-card border border-border bg-card p-3 pl-4 sm:gap-4 sm:p-4 sm:pl-5";

function Card({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  tone: "neutral" | "negative" | "positive";
}) {
  return (
    <>
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          tone === "negative" && "bg-destructive",
          tone === "positive" && "bg-success",
          tone === "neutral" && "bg-muted-foreground",
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full max-sm:hidden sm:size-11",
          tone === "negative" &&
            "bg-destructive/10 text-destructive dark:text-red-400",
          tone === "positive" && "bg-success/15 text-success",
          tone === "neutral" && "bg-muted text-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "block text-xl font-semibold tabular-nums sm:text-2xl",
            tone === "negative" && "text-destructive dark:text-red-400",
            tone === "positive" && "text-success",
          )}
        >
          {value}
        </span>
        <span className="block text-sm text-muted-foreground tabular-nums">
          {detail}
        </span>
      </span>
    </>
  );
}

/**
 * Cartões do resumo (screens/carteira-clientes.md). Os três de clientes são
 * atalhos para a situação na lista (clicar no ativo desfaz); o faturado é só
 * leitura.
 */
export function PortfolioSummaryCards({
  summary,
  filters,
  month,
}: PortfolioSummaryCardsProps) {
  // Link para a situação; no cartão já ativo, volta para todas.
  function statusLink(status: string) {
    const active = filters.status === status;
    const query = portfolioQuery(filters, month, {
      status: active ? DEFAULT_STATUS_FILTER : status,
      search: "",
    });
    return {
      href: `${PORTFOLIO_PATH}?${query}`,
      active,
    };
  }

  const all = statusLink(DEFAULT_STATUS_FILTER);
  const news = statusLink("novos");
  const lapsed = statusLink("sem-retorno");
  const completed = `${summary.completed} ${summary.completed === 1 ? "atendimento" : "atendimentos"}`;
  const linkClass = "transition-colors hover:bg-muted/50";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Link
        href={all.href}
        aria-current={all.active ? "page" : undefined}
        className={cn(cardClass, linkClass, all.active && "bg-muted/60")}
      >
        <Card
          icon={Users}
          label="Na carteira"
          value={summary.clients}
          detail={
            summary.packageSessions > 0
              ? `${completed} (${summary.packageSessions} de pacote)`
              : `${completed} no período`
          }
          tone="neutral"
        />
      </Link>
      <Link
        href={news.href}
        aria-current={news.active ? "page" : undefined}
        className={cn(cardClass, linkClass, news.active && "bg-muted/60")}
      >
        <Card
          icon={UserPlus}
          label="Novos"
          value={summary.newClients}
          detail="1º atendimento no período"
          tone="neutral"
        />
      </Link>
      <Link
        href={lapsed.href}
        aria-current={lapsed.active ? "page" : undefined}
        className={cn(
          cardClass,
          linkClass,
          lapsed.active && "bg-destructive/5",
        )}
      >
        <Card
          icon={UserX}
          label="Sem retorno"
          value={summary.lapsedClients}
          detail="Mais de 60 dias sem vir"
          tone="negative"
        />
      </Link>
      <div className={cardClass}>
        <Card
          icon={CircleCheck}
          label="Faturado"
          value={formatPrice(
            Number(summary.received) + Number(summary.pending),
          )}
          detail={
            <>
              <span className="block">
                Recebido {formatPrice(summary.received)}
              </span>
              <span className="block">
                Pendente {formatPrice(summary.pending)}
              </span>
              <span className="block">
                Ticket médio{" "}
                {summary.averageTicket
                  ? formatPrice(summary.averageTicket)
                  : "--"}
              </span>
            </>
          }
          tone="positive"
        />
      </div>
    </div>
  );
}
