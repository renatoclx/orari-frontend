import { cn } from "cn";
import type { Share } from "@/types/clients-report";
import { formatPercent } from "@/utils/format";

export type ShareRow = Share & {
  label: string;
  /** "Não informado" e "Outras": barra neutra, para não competir com os dados. */
  muted?: boolean;
};

/**
 * Uma distribuição em barras horizontais: o rótulo, a barra proporcional à
 * parte da base e os números escritos ao lado (a barra só dá a proporção de
 * relance). Tabela de verdade, para o leitor de tela.
 */
export function ShareList({
  title,
  description,
  rows,
  emptyMessage,
}: {
  title: string;
  /** Sobre o que é a porcentagem (ex.: "Dos clientes atendidos no período"). */
  description: string;
  rows: ShareRow[];
  emptyMessage: string;
}) {
  const empty = rows.every((row) => row.count === 0);

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4 print:break-inside-avoid">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {empty ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <table className="w-full text-sm tabular-nums">
          <thead className="sr-only">
            <tr>
              <th scope="col">{title}</th>
              <th scope="col">Quantidade</th>
              <th scope="col">Porcentagem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="w-full py-1.5 pr-3 text-left">
                  <span
                    className={cn(
                      "block font-medium",
                      row.muted && "text-muted-foreground",
                    )}
                  >
                    {row.label}
                  </span>
                  <span
                    className="mt-1 block h-1.5 rounded-full bg-muted"
                    aria-hidden="true"
                  >
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        row.muted ? "bg-muted-foreground" : "bg-chart-info",
                      )}
                      style={{ width: `${Math.min(row.share, 1) * 100}%` }}
                    />
                  </span>
                </th>
                <td className="px-2 py-1.5 text-right whitespace-nowrap">
                  {row.count}
                </td>
                <td className="py-1.5 pl-2 text-right whitespace-nowrap text-muted-foreground">
                  {formatPercent(row.share)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
