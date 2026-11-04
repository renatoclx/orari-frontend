import type { Metadata } from "next";
import { Suspense } from "react";
import { AgendaDayPage } from "@/components/agenda/AgendaDayPage";
import { AgendaLoading } from "@/components/agenda/AgendaLoading";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Agendamentos | Orari",
};

export default async function AgendaPage({ searchParams }: PageProps<"/">) {
  await requireFeature("appointments");
  const params = await searchParams;
  const date = typeof params.date === "string" ? params.date : "";

  // A chave troca com o dia: ao navegar, o esqueleto aparece enquanto o novo
  // dia carrega (um loading.tsx na raiz valeria para todas as telas da área).
  return (
    <Suspense key={date} fallback={<AgendaLoading />}>
      <AgendaDayPage searchParams={params} />
    </Suspense>
  );
}
