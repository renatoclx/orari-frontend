import type { AnamnesisListItem } from "@/types/anamnesis";
import { formatDateOnly } from "@/utils/format";

type HistoryAnamnesisProps = {
  anamneses: AnamnesisListItem[];
  footer: React.ReactNode;
};

/** Fichas de anamnese do cliente, na aba "Anamnese" (só leitura nesta lista). */
export function HistoryAnamnesis({ anamneses, footer }: HistoryAnamnesisProps) {
  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {anamneses.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            Nenhuma ficha de anamnese deste cliente.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {["Modelo", "Versão", "Acompanhamentos", "Última consulta"].map(
                  (title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {anamneses.map((item) => (
                <tr key={item.id} className="tabular-nums">
                  <td className="px-4 py-3 font-medium">
                    {item.template.name}
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
            </tbody>
          </table>
        )}
      </div>
      {footer}
    </div>
  );
}
