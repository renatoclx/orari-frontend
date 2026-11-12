import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ProfessionalCommissionSummary } from "@/types/professional-app";
import { formatPrice } from "@/utils/format";

/** A comissão no Início (só para quem usa e recebe): o mês e o que falta receber. */
export function HomeCommission({
  summary,
}: {
  summary: ProfessionalCommissionSummary;
}) {
  return (
    <Link
      href="/app/comissoes"
      className="flex items-center gap-3 rounded-card border border-border bg-card p-4"
    >
      <span className="grid flex-1 grid-cols-2 gap-3 text-sm">
        <span>
          <span className="block text-muted-foreground">Comissão do mês</span>
          <span className="block text-lg font-semibold">
            {formatPrice(summary.amount)}
          </span>
        </span>
        <span>
          <span className="block text-muted-foreground">A receber</span>
          <span className="block text-lg font-semibold">
            {formatPrice(summary.toPay)}
          </span>
        </span>
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}
