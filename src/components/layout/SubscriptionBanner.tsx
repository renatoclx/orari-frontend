import { Hourglass, Lock, TriangleAlert } from "lucide-react";
import type { SubscriptionNotice } from "@/components/layout/subscription-notice";

const ICONS = {
  trial: Hourglass,
  overdue: TriangleAlert,
  readOnly: Lock,
};

/**
 * Faixa no topo do painel com a situação da assinatura (screens/layout.md,
 * "Aviso da assinatura"): neutra no teste; tingida de vermelho no atraso e no
 * somente leitura. Fica fora da rolagem, acima do conteúdo.
 */
export function SubscriptionBanner({ notice }: { notice: SubscriptionNotice }) {
  const Icon = ICONS[notice.kind];
  const alert = notice.tone === "alert";
  return (
    <div
      role={alert ? "alert" : "status"}
      className={`flex shrink-0 items-start gap-2 border-b border-border px-4 py-2.5 text-sm md:px-8 ${
        alert ? "bg-destructive/10" : "bg-muted"
      }`}
    >
      <Icon
        className={`mt-0.5 size-4 shrink-0 ${alert ? "text-destructive dark:text-red-400" : "text-muted-foreground"}`}
        aria-hidden="true"
      />
      <p>{notice.message}</p>
    </div>
  );
}
