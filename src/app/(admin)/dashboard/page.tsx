import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Dashboard | Orari",
};

// Dashboard: só o ADMIN, com a funcionalidade no plano. Cada bloco segue a
// funcionalidade do relatório de origem.
export default async function DashboardRoute({
  searchParams,
}: PageProps<"/dashboard">) {
  const user = await requireFeature("dashboard");
  if (user.type !== "ADMIN") notFound();
  return <DashboardPage searchParams={await searchParams} />;
}
