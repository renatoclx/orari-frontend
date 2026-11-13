import Link from "next/link";
import {
  AlertCircle,
  Cake,
  ClipboardList,
  HandCoins,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { SummaryItem } from "@/types/auto-message";
import type { PendingSummary } from "@/types/pending-summary";
import { hasPending, pendingTiles } from "./pending-today";

const ICON: Record<SummaryItem, LucideIcon> = {
  PAYABLE_TODAY: Wallet,
  PAYABLE_OVERDUE: AlertCircle,
  RECEIVABLE_OVERDUE: HandCoins,
  OPEN_TABS: ClipboardList,
  BIRTHDAYS: Cake,
};

/**
 * "Pendências de hoje" no topo do Dashboard (screens/dashboard.md): os números
 * do dia, calculados na hora, cada um levando à tela já filtrada. Só mostra os
 * itens que o plano libera; sem nenhum, o bloco some.
 */
export function PendingToday({ summary }: { summary: PendingSummary }) {
  const tiles = pendingTiles(summary);
  if (tiles.length === 0) return null;

  return (
    <section aria-label="Pendências de hoje" className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Pendências de hoje
        </h2>
        {!hasPending(tiles) && (
          <p className="text-sm text-muted-foreground">Nada pendente hoje.</p>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((tile) => {
          const Icon = ICON[tile.item];
          const active = tile.count > 0;
          return (
            <li key={tile.item}>
              <Link
                href={tile.href}
                className={`flex h-full items-center gap-3 rounded-card border border-border bg-card p-4 hover:bg-muted ${
                  active ? "" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-2xl leading-none font-semibold tabular-nums">
                    {tile.count}
                  </span>
                  <span className="block text-sm leading-tight">
                    {tile.label}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
