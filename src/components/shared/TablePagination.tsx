import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";

type TablePaginationProps = {
  page: number;
  limit: number;
  total: number;
  basePath: string;
  /** Parâmetros a manter na URL ao trocar de página (ex.: a busca). */
  query?: Record<string, string | undefined>;
};

// Rodapé de paginação das listagens: fixo no fim do card, com borda no topo.
export function TablePagination({
  page,
  limit,
  total,
  basePath,
  query = {},
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  function hrefFor(target: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 md:px-6">
      <p className="text-sm text-muted-foreground tabular-nums">
        {total === 0
          ? "Nenhum registro"
          : `Exibindo ${first} a ${last} de ${total}`}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground tabular-nums">
          Página {Math.min(page, totalPages)} de {totalPages}
        </span>
        {page > 1 ? (
          <Hint label={`Ir para a página ${page - 1}`}>
            <Button variant="outline" size="icon" asChild>
              <Link href={hrefFor(page - 1)} aria-label="Página anterior">
                <ChevronLeft aria-hidden="true" />
              </Link>
            </Button>
          </Hint>
        ) : (
          // Desabilitado não recebe o mouse: a dica fica no invólucro.
          <Hint label="Você está na primeira página">
            <span className="inline-flex" tabIndex={0}>
              <Button
                variant="outline"
                size="icon"
                disabled
                aria-label="Página anterior"
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
            </span>
          </Hint>
        )}
        {page < totalPages ? (
          <Hint label={`Ir para a página ${page + 1}`}>
            <Button variant="outline" size="icon" asChild>
              <Link href={hrefFor(page + 1)} aria-label="Próxima página">
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </Hint>
        ) : (
          <Hint label="Você está na última página">
            <span className="inline-flex" tabIndex={0}>
              <Button
                variant="outline"
                size="icon"
                disabled
                aria-label="Próxima página"
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </span>
          </Hint>
        )}
      </div>
    </div>
  );
}
