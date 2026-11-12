import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_LINK =
  "flex h-10 items-center gap-2 rounded-control border border-border bg-card px-3 text-sm font-medium";

/** Anterior e Próxima das listas do app, com "Página X de Y"; some com uma só página. */
export function AppPagination({
  page,
  pages,
  href,
}: {
  page: number;
  pages: number;
  /** Endereço de cada página (mantém os demais filtros da URL). */
  href: (page: number) => string;
}) {
  if (pages <= 1) return null;
  return (
    <nav
      aria-label="Páginas"
      className="flex items-center justify-between gap-3"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={PAGE_LINK}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Anterior
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted-foreground">
        Página {page} de {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className={PAGE_LINK}>
          Próxima
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
