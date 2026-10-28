import { cn } from "cn";

/** Coluna com mais que o texto: classe própria ou um cabeçalho que não é texto. */
export type ListColumn = {
  /** Identifica a coluna (e é o texto do cabeçalho, se não houver `header`). */
  key: string;
  /** Conteúdo do cabeçalho: por exemplo, um "selecionar todos" ou um texto só para leitor de tela. */
  header?: React.ReactNode;
  /** Acrescentada ao `th` (por exemplo, `hidden xl:table-cell` para a coluna sumir em telas menores). */
  className?: string;
};

type ListCardProps = {
  /** Cabeçalhos da tabela (a partir de `md`): só o texto, ou uma `ListColumn`. */
  columns: (string | ListColumn)[];
  /** Linhas da tabela (`<tr>`), na ordem das colunas. */
  rows: React.ReactNode;
  /** Um cartão (`<li>`) por item, para o celular. */
  cards: React.ReactNode;
  /** Lista vazia: a mensagem aparece no lugar da tabela e dos cartões. */
  emptyMessage?: string;
  /** Faixa acima da lista, fora da rolagem (por exemplo, filtros em links). */
  toolbar?: React.ReactNode;
  /** Rodapé fixo do cartão (paginação). */
  footer?: React.ReactNode;
  /** Diálogos da lista; ficam fora da área com rolagem. */
  children?: React.ReactNode;
};

// Estilo do cabeçalho da tabela: fixo no topo enquanto a lista rola.
const headerClass =
  "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

/**
 * Casca das listagens (screen-patterns.md): cartão com rolagem, mensagem de
 * lista vazia, cartões no celular e tabela a partir de `md`, e o rodapé.
 * O conteúdo das linhas e dos cartões é de cada listagem; aqui fica só o que
 * se repetia em todas, como o ponto de troca celular/tabela.
 */
export function ListCard({
  columns,
  rows,
  cards,
  emptyMessage,
  toolbar,
  footer,
  children,
}: ListCardProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      {toolbar}

      <div className="min-h-0 flex-1 overflow-auto">
        {emptyMessage ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">{cards}</ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  {columns.map((column) => {
                    const { key, header, className } =
                      typeof column === "string" ? { key: column } : column;
                    return (
                      <th
                        key={key}
                        scope="col"
                        className={cn(headerClass, className)}
                      >
                        {header ?? key}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">{rows}</tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      {children}
    </div>
  );
}
