/**
 * Tabela simples da folha impressa: sem rolagem, ações nem paginação. As
 * linhas não quebram no meio entre duas folhas.
 */
export function PrintTable({
  columns,
  rows,
  emptyMessage,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <table className="w-full border-collapse text-sm tabular-nums">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground">
          {columns.map((column) => (
            <th key={column} className="px-2 py-1.5 font-medium">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, index) => (
          <tr key={index} className="break-inside-avoid border-b border-border">
            {cells.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-2 py-1.5 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
