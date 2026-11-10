import Link from "next/link";
import { Eye } from "lucide-react";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { Button } from "@/components/ui/button";
import type { CommissionSummary } from "@/types/commission";
import { formatPrice } from "@/utils/format";

type Row = CommissionSummary["byProfessional"][number];

/**
 * Comissões por profissional (sem profissional no filtro). "Ver" filtra o
 * profissional e mostra os atendimentos dele.
 */
export function CommissionProfessionalList({
  rows,
  hrefFor,
}: {
  rows: Row[];
  /** Link da tela com o profissional filtrado (mantém o período). */
  hrefFor: (professionalId: string) => string;
}) {
  const view = (row: Row) => (
    <Hint label="Ver atendimentos">
      <Button variant="ghost" size="icon" asChild>
        <Link
          href={hrefFor(row.id)}
          aria-label={`Ver atendimentos de ${row.name}`}
        >
          <Eye aria-hidden="true" />
        </Link>
      </Button>
    </Hint>
  );

  return (
    <ListCard
      toolbar={
        <h2 className="border-b border-border px-4 py-3 font-semibold">
          Por profissional
        </h2>
      }
      columns={[
        "Profissional",
        "Atendimentos",
        "Base",
        "Comissão",
        "Pago pelos clientes",
        { key: "Ações", header: <span className="sr-only">Ações</span> },
      ]}
      emptyMessage={
        rows.length > 0 ? undefined : "Nenhuma comissão no período."
      }
      rows={rows.map((row) => (
        <tr key={row.id} className="tabular-nums hover:bg-background">
          <td className="px-4 py-3 font-medium">{row.name}</td>
          <td className="px-4 py-3">{row.count}</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {formatPrice(row.base)}
          </td>
          <td className="px-4 py-3 font-medium whitespace-nowrap">
            {formatPrice(row.amount)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            {formatPrice(row.clientPaid)}
          </td>
          <td className="px-4 py-2">{view(row)}</td>
        </tr>
      ))}
      cards={rows.map((row) => (
        <li key={row.id} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium">{row.name}</span>
            {view(row)}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm tabular-nums">
            <dt className="text-muted-foreground">Comissão</dt>
            <dd className="font-medium">{formatPrice(row.amount)}</dd>
            <dt className="text-muted-foreground">Atendimentos</dt>
            <dd>{row.count}</dd>
            <dt className="text-muted-foreground">Pago pelos clientes</dt>
            <dd>{formatPrice(row.clientPaid)}</dd>
          </dl>
        </li>
      ))}
    />
  );
}
