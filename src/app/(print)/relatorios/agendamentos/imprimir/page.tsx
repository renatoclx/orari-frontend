import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppointmentReportPrintPage } from "@/components/appointment-report/AppointmentReportPrintPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Relatório de agendamentos (impressão) | Orari",
};

// Mesmo acesso da tela: só o ADMIN, com a funcionalidade no plano.
export default async function AppointmentReportPrintRoute({
  searchParams,
}: PageProps<"/relatorios/agendamentos/imprimir">) {
  const user = await requireFeature("appointments-report");
  if (user.type !== "ADMIN") notFound();
  return <AppointmentReportPrintPage searchParams={await searchParams} />;
}
