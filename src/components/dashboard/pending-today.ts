import type { SummaryItem } from "@/types/auto-message";
import type { PendingSummary } from "@/types/pending-summary";

// O bloco "Pendências de hoje" do Dashboard (screens/dashboard.md): o nome de
// cada item e a tela, já filtrada, que ele abre.

export type PendingTile = {
  item: SummaryItem;
  label: string;
  count: number;
  href: string;
};

const LABEL: Record<SummaryItem, string> = {
  PAYABLE_TODAY: "Contas a pagar hoje",
  PAYABLE_OVERDUE: "Contas atrasadas",
  RECEIVABLE_OVERDUE: "Recebimentos atrasados",
  OPEN_TABS: "Comandas do dia",
  BIRTHDAYS: "Aniversariantes",
};

/** A tela de cada item, com o filtro que mostra só aquilo (ver os filtros de cada tela). */
function hrefOf(item: SummaryItem, date: string): string {
  switch (item) {
    case "PAYABLE_TODAY":
      return `/financeiro/contas-a-pagar?status=pendentes&de=${date}&ate=${date}`;
    case "PAYABLE_OVERDUE":
      return "/financeiro/contas-a-pagar?status=atrasadas";
    case "RECEIVABLE_OVERDUE":
      return "/financeiro?status=atrasados";
    case "OPEN_TABS":
      return "/financeiro/comandas";
    case "BIRTHDAYS":
      return "/relatorios/perfil-do-cliente";
  }
}

/** Os quadros do bloco, na ordem da API (a do catálogo). */
export function pendingTiles({ date, items }: PendingSummary): PendingTile[] {
  return items.map(({ item, count }) => ({
    item,
    label: LABEL[item],
    count,
    href: hrefOf(item, date),
  }));
}

/** Há alguma coisa com número hoje? */
export function hasPending(tiles: PendingTile[]): boolean {
  return tiles.some((tile) => tile.count > 0);
}
