import { BusinessHoursForm } from "@/components/settings/BusinessHoursForm";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { getCurrentUser } from "@/services/auth.service";
import { listAllBusinessHours } from "@/services/business-hour.service";
import { getCompany } from "@/services/company.service";
import { formatCnpj, formatDateOnly } from "@/utils/format";

// Configurações da empresa: dados cadastrais (só leitura) e horários de
// funcionamento. Nome fantasia e logo passam a ser editáveis quando a API
// permitir ao administrador alterar a própria empresa.
export async function CompanySettingsPage() {
  const { company: current } = await getCurrentUser();
  const [company, hours] = await Promise.all([
    getCompany(current.id),
    listAllBusinessHours(),
  ]);

  const rows: [string, React.ReactNode][] = [
    ["Nome fantasia", company.fantasyName],
    ["Razão social", company.corporateReason],
    ["CNPJ", formatCnpj(company.cnpj)],
    ["Data de fundação", formatDateOnly(company.foundationDate)],
    ["Subdomínio", company.subdomain],
    ["Fuso horário", company.timezone],
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Configurações da empresa</h1>

      {/* key: depois de salvar, o formulário recomeça com os ids gravados. */}
      <BusinessHoursForm
        key={hours
          .map((hour) => `${hour.id}${hour.openAt}${hour.closeAt}`)
          .join("|")}
        hours={hours}
      >
        <section className="border-b border-border p-4 md:p-6">
          <h2 className="font-semibold">Dados da empresa</h2>
          <p className="text-sm text-muted-foreground">
            Dados cadastrais. Para alterá-los, fale com o suporte do Orari.
          </p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="tabular-nums">
                  <EmptyValue>{value}</EmptyValue>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </BusinessHoursForm>
    </div>
  );
}
