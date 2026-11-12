import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCommissions } from "@/components/professional-app/commissions-gate";
import { ProfessionalClosingReceiptView } from "@/components/professional-app/ProfessionalClosingReceipt";
import { ApiError } from "@/services/api";
import { getProfessionalClosing } from "@/services/app-pro.service";

export const metadata: Metadata = { title: "Recibo" };

/**
 * Recibo de um fechamento (screens/app-profissional.md). O de outro
 * profissional (ou um id inválido) cai na página não encontrada: a API
 * responde 404 e 400.
 */
export default async function AppClosingPage({
  params,
}: PageProps<"/app/comissoes/fechamentos/[id]">) {
  await requireCommissions();
  const { id } = await params;
  const receipt = await getProfessionalClosing(id).catch((error: unknown) => {
    if (error instanceof ApiError && [400, 404].includes(error.status)) {
      notFound();
    }
    throw error;
  });
  return <ProfessionalClosingReceiptView receipt={receipt} />;
}
