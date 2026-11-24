import Link from "next/link";
import { cn } from "cn";

/** Abas do quadro do profissional (o valor vai na URL, ?aba=). */
export type Tab = "atendimentos" | "adiantamentos" | "fechamentos";

/**
 * Abas do quadro do profissional (Atendimentos | Adiantamentos |
 * Fechamentos), por link:
 * a aba fica na URL (?aba=) e a página é renderizada no servidor.
 */
export function CommissionTabs({
  active,
  hrefFor,
  counts,
}: {
  active: Tab;
  hrefFor: (tab: Tab) => string;
  counts: Record<Tab, number>;
}) {
  const tab = (key: Tab, label: string) => (
    <Link
      href={hrefFor(key)}
      aria-current={active === key ? "page" : undefined}
      className={cn(
        "-mb-px border-b-2 px-1 py-3 text-sm font-semibold",
        active === key
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label} ({counts[key]})
    </Link>
  );
  return (
    <nav
      aria-label="Detalhe do profissional"
      className="flex gap-6 border-b border-border px-4"
    >
      {tab("atendimentos", "Atendimentos")}
      {tab("adiantamentos", "Adiantamentos")}
      {tab("fechamentos", "Fechamentos")}
    </nav>
  );
}
