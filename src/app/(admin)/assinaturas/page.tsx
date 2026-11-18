import type { Metadata } from "next";
import { SubscriptionsListPage } from "@/components/subscriptions/SubscriptionsListPage";

export const metadata: Metadata = {
  title: "Assinaturas | Orari",
};

export default async function SubscriptionsPage({
  searchParams,
}: PageProps<"/assinaturas">) {
  return <SubscriptionsListPage searchParams={await searchParams} />;
}
