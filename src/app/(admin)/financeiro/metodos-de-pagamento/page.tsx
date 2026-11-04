import type { Metadata } from "next";
import { PaymentMethodsListPage } from "@/components/payment-methods/PaymentMethodsListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Métodos de pagamento | Orari",
};

export default async function PaymentMethodsPage({
  searchParams,
}: PageProps<"/financeiro/metodos-de-pagamento">) {
  await requireFeature("payment-methods");
  return <PaymentMethodsListPage searchParams={await searchParams} />;
}
