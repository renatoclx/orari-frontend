import type { Metadata } from "next";
import { PaymentsListPage } from "@/components/payments/PaymentsListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Pagamentos | Orari",
};

export default async function PaymentsPage({
  searchParams,
}: PageProps<"/financeiro">) {
  await requireFeature("payments");
  return <PaymentsListPage searchParams={await searchParams} />;
}
