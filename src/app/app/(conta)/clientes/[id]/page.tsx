import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfessionalClientDetailView } from "@/components/professional-app/ProfessionalClientDetail";
import { ApiError } from "@/services/api";
import { getProfessionalClient } from "@/services/app-pro.service";
import { getAppSessionKind } from "@/services/app-session";

export const metadata: Metadata = { title: "Cliente" };

/**
 * Ficha do cliente (screens/app-profissional.md). Cliente que não é dele (ou
 * que não existe) cai na página não encontrada: a API responde 404 nos dois casos.
 */
export default async function AppClientPage({
  params,
}: PageProps<"/app/clientes/[id]">) {
  if ((await getAppSessionKind()) !== "professional") notFound();
  const { id } = await params;
  const client = await getProfessionalClient(id).catch((error: unknown) => {
    // O id pode não ser um UUID (400) ou não ser da carteira dele (404).
    if (error instanceof ApiError && [400, 404].includes(error.status)) {
      notFound();
    }
    throw error;
  });
  return <ProfessionalClientDetailView client={client} />;
}
