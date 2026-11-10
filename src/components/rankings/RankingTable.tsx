/** Uma coluna de valor do ranking (o nome e a posição são fixos). */
export type RankingColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
};

type RankingTableProps<T extends { id: string; name: string }> = {
  title: string;
  /** "Serviço", "Profissional", "Cliente". */
  nameHeader: string;
  rows: T[];
  columns: RankingColumn<T>[];
  /** O número da ordem atual: a barra embaixo do nome é proporcional a ele. */
  barValue: (row: T) => number;
  emptyMessage: string;
};

/**
 * Um ranking: posição, nome com uma barra proporcional ao critério da ordem
 * (o índigo dos gráficos; o número está escrito ao lado, a barra só dá a
 * distância de relance) e as colunas de valor. Tabela de verdade, com
 * rolagem lateral no celular.
 */
export function RankingTable<T extends { id: string; name: string }>({
  title,
  nameHeader,
  rows,
  columns,
  barValue,
  emptyMessage,
}: RankingTableProps<T>) {
  const max = Math.max(0, ...rows.map(barValue));

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4 print:break-inside-avoid">
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        // Rola de lado no celular: com foco, dá para rolar pelo teclado.
        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label={`Tabela: ${title}`}
        >
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-border text-left whitespace-nowrap text-muted-foreground">
                <th scope="col" className="w-8 py-2 pr-2 font-medium">
                  <span className="sr-only">Posição</span>
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  {nameHeader}
                </th>
                {columns.map((column) => (
                  <th
                    key={column.header}
                    scope="col"
                    className="px-2 py-2 text-right font-medium"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="py-2 pr-2 text-muted-foreground">
                    {index + 1}º
                  </td>
                  <th scope="row" className="min-w-40 py-2 pr-3 text-left">
                    <span className="block font-medium">{row.name}</span>
                    <span
                      className="mt-1 block h-1.5 rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <span
                        className="block h-full rounded-full bg-chart-info"
                        style={{
                          width: `${max > 0 ? (barValue(row) / max) * 100 : 0}%`,
                        }}
                      />
                    </span>
                  </th>
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className="px-2 py-2 text-right whitespace-nowrap"
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
