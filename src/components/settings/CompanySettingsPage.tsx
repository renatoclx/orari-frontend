import { CompanySettingsForm } from "@/components/settings/CompanySettingsForm";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { getCurrentUser } from "@/services/auth.service";
import { listAllBusinessHours } from "@/services/business-hour.service";
import { getCompany } from "@/services/company.service";
import { documentLabel, formatDateOnly, formatDocument } from "@/utils/format";

// Configurações da empresa: identidade (nome fantasia e logo), dados cadastrais
// (só leitura) e horários de funcionamento.
export async function CompanySettingsPage() {
  const { company: current } = await getCurrentUser();
  const [company, hours] = await Promise.all([
    getCompany(current.id),
    listAllBusinessHours(),
  ]);

  // Quem usa CPF não tem data de fundação: a linha some em vez de mostrar "--".
  const rows: [string, React.ReactNode][] = [
    ["Razão social", company.corporateReason],
    [documentLabel(company.document), formatDocument(company.document)],
    ...(company.foundationDate
      ? ([["Data de fundação", formatDateOnly(company.foundationDate)]] as [
          string,
          React.ReactNode,
        ][])
      : []),
    ["Subdomínio", company.subdomain],
    ["Fuso horário", company.timezone],
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Configurações da empresa</h1>

      {/* key: depois de salvar, o formulário recomeça com o que foi gravado
          (as janelas novas passam a ter id). */}
      <CompanySettingsForm
        key={[
          company.fantasyName,
          company.logoUrl,
          ...hours.map((hour) => `${hour.id}${hour.openAt}${hour.closeAt}`),
        ].join("|")}
        fantasyName={company.fantasyName}
        logoUrl={company.logoUrl}
        hours={hours}
        details={
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
        }
      />
    </div>
  );
}
