import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft, Info, Plus, RefreshCw } from "lucide-react";
import { AnamnesisPdfDialog } from "@/components/anamnesis/records/AnamnesisPdfDialog";
import { AnamnesisTimeline } from "@/components/anamnesis/records/AnamnesisTimeline";
import { CurrentAnswers } from "@/components/anamnesis/records/CurrentAnswers";
import { Button } from "@/components/ui/button";
import { isUuid } from "@/lib/uuid";
import { requireAnamnesisAccess } from "@/lib/anamnesis-guard";
import { ApiError } from "@/services/api";
import { getAnamnesis, listAnamneses } from "@/services/anamnesis.service";
import { getTemplate } from "@/services/anamnesis-template.service";
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
 * Versão mais nova do modelo para a qual a ficha pode ser atualizada, ou nulo:
 * o modelo precisa estar ativo, ter versão acima da ficha, e o cliente ainda não
 * pode ter ficha dessa versão (uma por cliente e versão). Se o modelo não puder
 * ser lido, a ficha só não oferece a atualização.
 */
async function newerVersion(
  detail: Awaited<ReturnType<typeof getAnamnesis>>,
): Promise<number | null> {
  const [template, fichas] = await Promise.all([
    getTemplate(detail.template.id).catch((error: unknown) => {
      if (error instanceof ApiError) return null;
      throw error;
    }),
    listAnamneses({ clientId: detail.client.id, page: 1, limit: 100 }),
  ]);
  if (!template?.isActive) return null;
  const latest = template.currentVersion.version;
  if (latest <= detail.version.version) return null;
  const hasLatest = fichas.items.some(
    (item) =>
      item.template.id === template.id && item.templateVersion === latest,
  );
  return hasLatest ? null : latest;
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
  // Ids da URL fora do formato: 404 (e nunca vão para o caminho da API).
  if (!isUuid(clientId) || !isUuid(id)) notFound();
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

  const active = client.deletedAt === null;
  // Substituída por uma versão nova: só consulta, sem acompanhamento nem atualização.
  const replaced = detail.replacedBy !== null;
  const [appointments, latest] = await Promise.all([
    appointmentLabels(
      detail.entries.flatMap((entry) =>
        entry.appointmentId ? [entry.appointmentId] : [],
      ),
      user.company.timezone,
    ),
    // Cliente inativo não recebe ficha nova, e a substituída já foi atualizada:
    // nem pergunta pelo modelo.
    active && !replaced ? newerVersion(detail) : null,
  ]);

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
          {/* A atual leva às versões anteriores, que ficam só para consulta. */}
          {detail.previous.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Versão anterior:{" "}
              {detail.previous.map((item, index) => (
                <span key={item.id}>
                  {index > 0 && ", "}
                  <Link
                    href={`/clientes/${clientId}/anamnese/${item.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    versão {item.version}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 max-sm:w-full">
          {/* Imprimir (PDF) só no computador. */}
          <div className="max-sm:hidden">
            <AnamnesisPdfDialog clientId={clientId} anamnesisId={id} />
          </div>
          {/* Cliente inativo: a ficha só se consulta (a API recusa o acompanhamento). */}
          {active && !replaced && (
            <Button asChild className="max-sm:w-full">
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

      {detail.replacedBy && (
        <div
          role="note"
          className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-muted px-3 py-2 text-sm"
        >
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Esta ficha foi atualizada para a versão {
              detail.replacedBy.version
            }{" "}
            e fica só para consulta. Os novos acompanhamentos vão na ficha
            atual.
          </p>
          <Button asChild variant="outline" className="max-sm:w-full">
            <Link
              href={`/clientes/${clientId}/anamnese/${detail.replacedBy.id}`}
            >
              <ArrowRight aria-hidden="true" />
              Abrir ficha atual
            </Link>
          </Button>
        </div>
      )}

      {/* Modelo mudou (ex.: novo termo de responsabilidade): a ficha nova traz
          as respostas desta, e esta fica guardada com o histórico. */}
      {latest !== null && (
        <div
          role="note"
          className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-muted px-3 py-2 text-sm"
        >
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Há uma versão mais nova deste modelo (versão {latest}). Atualize a
            ficha para usá-la: as respostas desta vêm preenchidas, e esta fica
            guardada com o histórico.
          </p>
          <Button asChild variant="outline" className="max-sm:w-full">
            <Link href={`/anamnese/fichas/nova?clienteId=${clientId}&de=${id}`}>
              <RefreshCw aria-hidden="true" />
              Atualizar ficha
            </Link>
          </Button>
        </div>
      )}

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
