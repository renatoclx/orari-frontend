import Link from "next/link";
import { cn } from "cn";

export const HISTORY_TABS = [
  { id: "agendamentos", label: "Agendamentos" },
  { id: "recorrencias", label: "Recorrências" },
  { id: "pacotes", label: "Pacotes" },
  { id: "pagamentos", label: "Pagamentos" },
  { id: "anamnese", label: "Anamnese" },
] as const;

export type HistoryTab = (typeof HISTORY_TABS)[number]["id"];

/** Abas do histórico como links (a aba vai na URL; cada uma busca os próprios dados). */
export function HistoryTabs({
  basePath,
  current,
  showAnamnesis,
}: {
  basePath: string;
  current: HistoryTab;
  /** A aba Anamnese só aparece para quem tem acesso às fichas. */
  showAnamnesis: boolean;
}) {
  return (
    <nav aria-label="Histórico do cliente" className="border-b border-border">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {HISTORY_TABS.filter(
          (tab) => showAnamnesis || tab.id !== "anamnese",
        ).map((tab) => {
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
