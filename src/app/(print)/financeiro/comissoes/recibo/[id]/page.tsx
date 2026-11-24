import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommissionReceipt } from "@/components/commissions/CommissionReceipt";
import { requireFeature } from "@/lib/require-feature";
import { isUuid } from "@/lib/uuid";
import { ApiError } from "@/services/api";
import { getClosingReceipt } from "@/services/commission.service";

export const metadata: Metadata = {
  title: "Recibo de comissão | Orari",
};

// Recibo do fechamento: mesmo acesso das Comissões (só o ADMIN).
export default async function CommissionReceiptRoute({
  params,
}: PageProps<"/financeiro/comissoes/recibo/[id]">) {
  const user = await requireFeature("commissions");
  if (user.type !== "ADMIN") notFound();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const receipt = await getClosingReceipt(id).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  return (
    <CommissionReceipt receipt={receipt} timeZone={user.company.timezone} />
  );
}
