import type { Metadata } from "next";
import { PlansListPage } from "@/components/plans/PlansListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Planos | Orari",
};

export default async function PlansPage({
  searchParams,
}: PageProps<"/pacotes/planos">) {
  await requireFeature("plans");
  return <PlansListPage searchParams={await searchParams} />;
}
