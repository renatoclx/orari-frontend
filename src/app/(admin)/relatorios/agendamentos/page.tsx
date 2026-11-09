import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppointmentReportPage } from "@/components/appointment-report/AppointmentReportPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Relatório de agendamentos | Orari",
};

// Relatórios → Agendamentos: só o ADMIN, com a funcionalidade no plano.
export default async function AppointmentReportRoute({
  searchParams,
}: PageProps<"/relatorios/agendamentos">) {
  const user = await requireFeature("appointments-report");
  if (user.type !== "ADMIN") notFound();
  return <AppointmentReportPage searchParams={await searchParams} />;
}
