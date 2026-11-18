import type { Metadata } from "next";
import { PaymentsListPage } from "@/components/subscription-payments/PaymentsListPage";

export const metadata: Metadata = {
  title: "Cobranças | Orari",
};

export default async function PaymentsRoute({
  searchParams,
}: PageProps<"/cobrancas">) {
  return <PaymentsListPage searchParams={await searchParams} />;
}
