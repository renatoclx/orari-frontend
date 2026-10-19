import Link from "next/link";
import { cn } from "cn";

export const HISTORY_TABS = [
  { id: "agendamentos", label: "Agendamentos" },
  { id: "recorrencias", label: "Recorrências" },
  { id: "pacotes", label: "Pacotes" },
  { id: "pagamentos", label: "Pagamentos" },
] as const;

export type HistoryTab = (typeof HISTORY_TABS)[number]["id"];

/** Abas do histórico como links (a aba vai na URL; cada uma busca os próprios dados). */
export function HistoryTabs({
  basePath,
  current,
}: {
  basePath: string;
  current: HistoryTab;
}) {
  return (
    <nav aria-label="Histórico do cliente" className="border-b border-border">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {HISTORY_TABS.map((tab) => {
          const active = tab.id === current;
          return (
            <li key={tab.id}>
              <Link
                href={`${basePath}?aba=${tab.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center border-b-2 px-4 text-sm whitespace-nowrap",
                  active
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
