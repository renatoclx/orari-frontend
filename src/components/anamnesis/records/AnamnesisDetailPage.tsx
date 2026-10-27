import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { AnamnesisPdfDialog } from "@/components/anamnesis/records/AnamnesisPdfDialog";
import { AnamnesisTimeline } from "@/components/anamnesis/records/AnamnesisTimeline";
import { CurrentAnswers } from "@/components/anamnesis/records/CurrentAnswers";
import { Button } from "@/components/ui/button";
import { requireAnamnesisAccess } from "@/lib/anamnesis-guard";
import { ApiError } from "@/services/api";
import { getAnamnesis } from "@/services/anamnesis.service";
import { getAppointment } from "@/services/appointment.service";
import { getPerson } from "@/services/people.service";
import { formatDateOnly } from "@/utils/format";
import { toDateString, toTimeString } from "@/utils/time";

type AnamnesisDetailPageProps = {
  /** Cliente da URL: a ficha precisa ser dele. */
  clientId: string;
  id: string;
};

// Texto de cada agendamento vinculado a um acompanhamento ("Massagem · 21/01/2027
// às 14:30 · com Paula"), pelo id. Se um deles não puder ser lido (removido ou sem
// permissão), fica sem texto e a evolução mostra um aviso, sem quebrar a página.
async function appointmentLabels(
  ids: string[],
  timeZone: string,
): Promise<Record<string, string | null>> {
  const unique = [...new Set(ids)];
  const labels = await Promise.all(
    unique.map(async (id) => {
      try {
        const item = await getAppointment(id);
        const date = toDateString(new Date(item.startAt), timeZone);
        return `${item.service.name} · ${formatDateOnly(`${date}T00:00:00Z`)} às ${toTimeString(item.startAt, timeZone)} · com ${item.professional.name}`;
      } catch (error) {
        if (error instanceof ApiError) return null;
        throw error;
      }
    }),
  );
  return Object.fromEntries(unique.map((id, index) => [id, labels[index]]));
}

/**
 * Ficha completa (somente leitura): situação atual à esquerda e histórico à
 * direita; empilhados no celular. Nada aqui altera a ficha.
 */
export async function AnamnesisDetailPage({
  clientId,
  id,
}: AnamnesisDetailPageProps) {
  const user = await requireAnamnesisAccess();
  const orNotFound = (error: unknown): never => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  };
  const [detail, client] = await Promise.all([
    getAnamnesis(id).catch(orNotFound),
    getPerson(clientId).catch(orNotFound),
  ]);
  // Ficha de outro cliente na URL: trata como inexistente.
  if (detail.client.id !== clientId) notFound();

  const appointments = await appointmentLabels(
    detail.entries.flatMap((entry) =>
      entry.appointmentId ? [entry.appointmentId] : [],
    ),
    user.company.timezone,
  );

  const backHref = `/clientes/${clientId}?aba=anamnese`;
  const sectionClass =
    "rounded-card border border-border bg-card p-4 md:p-6 lg:min-h-0 lg:overflow-auto";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
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
        <div className="flex flex-wrap items-center gap-2">
          <AnamnesisPdfDialog clientId={clientId} anamnesisId={id} />
          {/* Cliente inativo: a ficha só se consulta (a API recusa o acompanhamento). */}
          {client.deletedAt === null && (
            <Button asChild>
              <Link
                href={`/clientes/${clientId}/anamnese/${id}/acompanhamento`}
              >
                <Plus aria-hidden="true" />
                Novo acompanhamento
              </Link>
            </Button>
          )}
        </div>
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
          <AnamnesisTimeline detail={detail} appointments={appointments} />
        </section>
      </div>
    </div>
  );
}
