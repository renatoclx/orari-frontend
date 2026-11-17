import type { SubscriptionSummary } from "@/types/auth";

// Faixa de aviso da assinatura no topo do painel (screens/layout.md, "Aviso
// da assinatura"). Função pura: o "hoje" chega pronto, no fuso da empresa.

export type SubscriptionNotice = {
  /** neutral: em teste; alert: em atraso, somente leitura ou cancelada. */
  tone: "neutral" | "alert";
  kind: "trial" | "overdue" | "readOnly";
  message: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Dias de calendário entre duas datas "aaaa-mm-dd".
function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) /
      DAY_MS,
  );
}

// "2026-12-06" → "06/12"
const dayMonth = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Aviso a mostrar; nulo sem assinatura ou com ela ativa. */
export function subscriptionNotice(
  subscription: SubscriptionSummary | null | undefined,
  todayIso: string,
): SubscriptionNotice | null {
  if (!subscription) return null;
  const { status, endsAt } = subscription;

  if (status === "TRIAL" && endsAt) {
    const left = daysBetween(todayIso, endsAt);
    const message =
      left <= 0
        ? "Hoje é o último dia do seu teste grátis."
        : `Seu teste grátis termina em ${left} ${left === 1 ? "dia" : "dias"} (${dayMonth(endsAt)}).`;
    return { tone: "neutral", kind: "trial", message };
  }
  if (status === "OVERDUE" && endsAt) {
    // endsAt é o último dia da tolerância: o somente leitura começa no dia seguinte.
    const blockIso = new Date(Date.parse(`${endsAt}T00:00:00Z`) + DAY_MS)
      .toISOString()
      .slice(0, 10);
    return {
      tone: "alert",
      kind: "overdue",
      message: `O pagamento da assinatura venceu. A partir de ${dayMonth(blockIso)}, o sistema fica somente para consulta.`,
    };
  }
  if (status === "READ_ONLY" || status === "CANCELED") {
    return {
      tone: "alert",
      kind: "readOnly",
      message:
        status === "CANCELED"
          ? "A assinatura foi cancelada: os dados podem ser consultados, mas não alterados."
          : "O sistema está somente para consulta: regularize a assinatura para voltar a cadastrar e alterar.",
    };
  }
  return null;
}
