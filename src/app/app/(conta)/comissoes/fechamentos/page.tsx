import type { Metadata } from "next";
import { ProfessionalClosings } from "@/components/professional-app/ProfessionalClosings";
import { parsePageParam } from "@/components/professional-app/professional-clients";

export const metadata: Metadata = { title: "Fechamentos" };

// Fechamentos de comissão dele (screens/app-profissional.md), 10 por página
// (`?pagina=`; valor inválido vale 1).
export default async function AppClosingsPage({
  searchParams,
}: PageProps<"/app/comissoes/fechamentos">) {
  const { pagina } = await searchParams;
  return <ProfessionalClosings page={parsePageParam(pagina)} />;
}
