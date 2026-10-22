import type { Metadata } from "next";
import { CheckoutsListPage } from "@/components/checkouts/CheckoutsListPage";

export const metadata: Metadata = {
  title: "Comandas | Orari",
};

export default async function CheckoutsPage({
  searchParams,
}: PageProps<"/financeiro/comandas">) {
  return <CheckoutsListPage searchParams={await searchParams} />;
}
