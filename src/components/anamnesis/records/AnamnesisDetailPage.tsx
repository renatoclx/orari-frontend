import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AnamnesisTimeline } from "@/components/anamnesis/records/AnamnesisTimeline";
import { CurrentAnswers } from "@/components/anamnesis/records/CurrentAnswers";
import { requireAnamnesisAccess } from "@/lib/anamnesis-guard";
import { ApiError } from "@/services/api";
import { getAnamnesis } from "@/services/anamnesis.service";
import { formatDateOnly } from "@/utils/format";

type AnamnesisDetailPageProps = {
  /** Cliente da URL: a ficha precisa ser dele. */
  clientId: string;
  id: string;
};

/**
 * Ficha completa (somente leitura): situação atual à esquerda e histórico à
 * direita; empilhados no celular. Nada aqui altera a ficha.
 */
export async function AnamnesisDetailPage({
  clientId,
  id,
}: AnamnesisDetailPageProps) {
  await requireAnamnesisAccess();
  const detail = await getAnamnesis(id).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  // Ficha de outro cliente na URL: trata como inexistente.
  if (detail.client.id !== clientId) notFound();

  const backHref = `/clientes/${clientId}?aba=anamnese`;
  const sectionClass =
    "rounded-card border border-border bg-card p-4 md:p-6 lg:min-h-0 lg:overflow-auto";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {detail.client.name}
        </Link>
        <h1 className="text-2xl font-semibold">{detail.template.name}</h1>
        <p className="text-sm text-muted-foreground">
          Versão {detail.version.version} do modelo
          {detail.entries[0] &&
            ` · registro inicial em ${formatDateOnly(detail.entries[0].consultationDate)}`}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-auto lg:grid-cols-2 lg:overflow-hidden">
        <section aria-labelledby="current-title" className={sectionClass}>
          <h2 id="current-title" className="mb-4 font-semibold">
            Situação atual
          </h2>
          <CurrentAnswers detail={detail} />
        </section>
        <section aria-labelledby="history-title" className={sectionClass}>
          <h2 id="history-title" className="mb-4 font-semibold">
            Evolução
          </h2>
          <AnamnesisTimeline detail={detail} />
        </section>
      </div>
    </div>
  );
}
