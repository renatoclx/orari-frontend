import Link from "next/link";
import { Plus } from "lucide-react";
import { ListCard } from "@/components/shared/ListCard";
import { Button } from "@/components/ui/button";
import type { AnamnesisListItem } from "@/types/anamnesis";
import { formatDateOnly } from "@/utils/format";

type HistoryAnamnesisProps = {
  /** Cliente dono das fichas: a ficha abre em /clientes/[clientId]/anamnese/[id]. */
  clientId: string;
  /** Cliente inativo não recebe fichas novas. */
  canCreate: boolean;
  anamneses: AnamnesisListItem[];
  footer: React.ReactNode;
};

/** Fichas de anamnese do cliente, na aba "Anamnese" (só leitura nesta lista). */
export function HistoryAnamnesis({
  clientId,
  canCreate,
  anamneses,
  footer,
}: HistoryAnamnesisProps) {
  const fichaHref = (id: string) => `/clientes/${clientId}/anamnese/${id}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {canCreate && (
        <div className="flex justify-end">
          {/* A mesma tela do menu Anamnese, com o cliente já escolhido. */}
          <Button asChild className="max-sm:w-full">
            <Link href={`/anamnese/fichas/nova?clienteId=${clientId}`}>
              <Plus aria-hidden="true" />
              Nova ficha
            </Link>
          </Button>
        </div>
      )}
      <ListCard
        columns={["Modelo", "Versão", "Acompanhamentos", "Última consulta"]}
        emptyMessage={
          anamneses.length === 0
            ? "Nenhuma ficha de anamnese deste cliente."
            : undefined
        }
        cards={anamneses.map((item) => (
          <li key={item.id} className="space-y-0.5 p-4 text-sm tabular-nums">
            <p className="font-medium">
              <Link href={fichaHref(item.id)} className="hover:underline">
                {item.template.name}
              </Link>
            </p>
            {/* O registro inicial não é acompanhamento. Data pura: formatDateOnly lê em UTC. */}
            <p className="text-muted-foreground">
              v{item.templateVersion} · {Math.max(0, item.entriesCount - 1)}{" "}
              acompanhamento(s) · última consulta em{" "}
              {formatDateOnly(item.lastConsultationDate)}
            </p>
          </li>
        ))}
        rows={anamneses.map((item) => (
          <tr key={item.id} className="tabular-nums">
            <td className="px-4 py-3 font-medium">
              <Link href={fichaHref(item.id)} className="hover:underline">
                {item.template.name}
              </Link>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              v{item.templateVersion}
            </td>
            {/* O registro inicial não é acompanhamento. */}
            <td className="px-4 py-3 whitespace-nowrap">
              {Math.max(0, item.entriesCount - 1)}
            </td>
            {/* Data pura: formatDateOnly lê em UTC (sem voltar um dia). */}
            <td className="px-4 py-3 whitespace-nowrap">
              {formatDateOnly(item.lastConsultationDate)}
            </td>
          </tr>
        ))}
        footer={footer}
      />
    </div>
  );
}
