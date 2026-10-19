import type { Metadata } from "next";
import { PlansListPage } from "@/components/plans/PlansListPage";

export const metadata: Metadata = {
  title: "Planos | Orari",
};

export default async function PlansPage({
  searchParams,
}: PageProps<"/pacotes/planos">) {
  return <PlansListPage searchParams={await searchParams} />;
}
