import type { Metadata } from "next";
import { ProfessionalCommissions } from "@/components/professional-app/ProfessionalCommissions";
import { parsePageParam } from "@/components/professional-app/professional-clients";
import { parseMonthParam } from "@/components/professional-app/professional-commissions";

export const metadata: Metadata = { title: "Comissões" };

/**
 * Comissões do profissional (screens/app-profissional.md). O mês vem de
 * `?mes=AAAA-MM` e a página de `?pagina=`; valor inválido vale como o padrão
 * (mês atual, página 1). Quem não é profissional, ou empresa sem comissões, cai
 * na página não encontrada.
 */
export default async function AppCommissionsPage({
  searchParams,
}: PageProps<"/app/comissoes">) {
  const { mes, pagina } = await searchParams;
  return (
    <ProfessionalCommissions
      month={parseMonthParam(mes)}
      page={parsePageParam(pagina)}
    />
  );
}
