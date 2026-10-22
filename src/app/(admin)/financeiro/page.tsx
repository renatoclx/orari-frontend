import type { Metadata } from "next";
import { PaymentsListPage } from "@/components/payments/PaymentsListPage";

export const metadata: Metadata = {
  title: "Pagamentos | Orari",
};

export default async function PaymentsPage({
  searchParams,
}: PageProps<"/financeiro">) {
  return <PaymentsListPage searchParams={await searchParams} />;
}
