import type { Metadata } from "next";
import { PaymentMethodsListPage } from "@/components/payment-methods/PaymentMethodsListPage";

export const metadata: Metadata = {
  title: "Métodos de pagamento | Orari",
};

export default async function PaymentMethodsPage({
  searchParams,
}: PageProps<"/financeiro/metodos-de-pagamento">) {
  return <PaymentMethodsListPage searchParams={await searchParams} />;
}
