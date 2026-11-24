import Link from "next/link";
import { Search } from "lucide-react";

/** Atalho do Início para a aba Buscar, com cara de campo de busca. */
export function SearchShortcut() {
  return (
    <Link
      href="/app/buscar"
      className="flex h-14 items-center gap-3 rounded-card bg-card px-4 text-muted-foreground hover:bg-accent"
    >
      <Search className="size-5 shrink-0" aria-hidden="true" />
      Encontre um estabelecimento
    </Link>
  );
}
