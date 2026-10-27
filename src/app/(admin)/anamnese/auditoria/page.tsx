import type { Metadata } from "next";
import { AuditPage } from "@/components/anamnesis/audit/AuditPage";

export const metadata: Metadata = {
  title: "Auditoria | Orari",
};

export default async function AuditRoute({
  searchParams,
}: PageProps<"/anamnese/auditoria">) {
  return <AuditPage searchParams={await searchParams} />;
}
