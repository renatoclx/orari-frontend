import type { Metadata } from "next";
import { CheckoutsListPage } from "@/components/checkouts/CheckoutsListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Comandas | Orari",
};

export default async function CheckoutsPage({
  searchParams,
}: PageProps<"/financeiro/comandas">) {
  await requireFeature("tabs");
  return <CheckoutsListPage searchParams={await searchParams} />;
}
