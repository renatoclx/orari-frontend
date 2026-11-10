import {
  KIND_LABELS,
  ageLabel,
  cityLabel,
} from "@/components/clients-report/clients-report-filters";
import { ShareList } from "@/components/clients-report/ShareList";
import type { ClientsReport } from "@/types/clients-report";

/** As quatro distribuições do perfil: tipo, origem, idade e cidade. */
export function ClientsReportDistributions({
  report,
}: {
  report: ClientsReport;
}) {
  return (
    // Na impressão (largura A4), duas colunas para caber na primeira folha.
    <div className="grid gap-3 xl:grid-cols-2 print:grid-cols-2">
      <ShareList
        title="Tipo de atendimento"
        description="Dos clientes atendidos no período (um cliente pode ter mais de um tipo)."
        emptyMessage="Nenhum atendimento concluído no período."
        rows={(Object.keys(KIND_LABELS) as (keyof typeof KIND_LABELS)[]).map(
          (kind) => ({ label: KIND_LABELS[kind], ...report.kinds[kind] }),
        )}
      />
      <ShareList
        title="Por onde agendam"
        description={`Dos atendimentos concluídos no período. ${report.withApp.count} ${report.withApp.count === 1 ? "cliente tem" : "clientes têm"} o app.`}
        emptyMessage="Nenhum atendimento concluído no período."
        rows={[
          { label: "Pela clínica", ...report.sources.clinic },
          { label: "Pelo app", ...report.sources.portal },
        ]}
      />
      <ShareList
        title="Faixa etária"
        description="Dos clientes cadastrados, pela idade de hoje."
        emptyMessage="Nenhum cliente cadastrado."
        rows={report.ages.map((age) => ({
          label: ageLabel(age.key),
          muted: age.key === null,
          ...age,
        }))}
      />
      <ShareList
        title="Cidades"
        description="Dos clientes cadastrados, pelo endereço principal."
        emptyMessage="Nenhum cliente cadastrado."
        rows={report.cities.map((city) => ({
          label: cityLabel(city.name),
          muted: city.name === null || city.others === true,
          ...city,
        }))}
      />
    </div>
  );
}
