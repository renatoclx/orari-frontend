import { notFound } from "next/navigation";
import { EntryForm } from "@/components/anamnesis/records/EntryForm";
import { isUuid } from "@/lib/uuid";
import { requireAnamnesisAccess } from "@/lib/anamnesis-guard";
import { ApiError } from "@/services/api";
import { getAnamnesis } from "@/services/anamnesis.service";
import { listClientAppointments } from "@/services/appointment.service";
import { getPerson } from "@/services/people.service";
import { formatDateOnly } from "@/utils/format";
import { toDateString, toTimeString } from "@/utils/time";

type EntryFormPageProps = {
  clientId: string;
  id: string;
};

// Inexistente: a API responde 404.
const orNotFound = (error: unknown): never => {
  if (error instanceof ApiError && error.status === 404) notFound();
  throw error;
};

/**
 * Novo acompanhamento (página): busca a ficha, o cliente e os agendamentos dele
 * e entrega ao formulário. Cliente inativo não aceita acompanhamento: 404.
 */
export async function EntryFormPage({ clientId, id }: EntryFormPageProps) {
  const user = await requireAnamnesisAccess();
  if (!isUuid(clientId) || !isUuid(id)) notFound();
  const timeZone = user.company.timezone;
  const [detail, client, appointments] = await Promise.all([
    getAnamnesis(id).catch(orNotFound),
    getPerson(clientId).catch(orNotFound),
    listClientAppointments({
      clientId,
      order: "desc",
      page: 1,
      limit: 100,
    }),
  ]);
  if (detail.client.id !== clientId || client.deletedAt !== null) notFound();

  const initial = detail.entries[0];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Novo acompanhamento</h1>
        <p className="text-sm text-muted-foreground">
          {detail.client.name} · {detail.template.name}
        </p>
      </div>

      <EntryForm
        clientId={clientId}
        anamnesisId={id}
        questions={[...detail.version.questions].sort(
          (a, b) => a.position - b.position,
        )}
        current={Object.fromEntries(
          detail.current.map((answer) => [answer.questionId, answer.value]),
        )}
        appointments={appointments.items.map((item) => {
          const date = toDateString(new Date(item.startAt), timeZone);
          return {
            id: item.id,
            label: `${item.service.name} · ${formatDateOnly(`${date}T00:00:00Z`)} às ${toTimeString(item.startAt, timeZone)}`,
          };
        })}
        today={toDateString(new Date(), timeZone)}
        initialDate={(initial?.consultationDate ?? detail.createdAt).slice(
          0,
          10,
        )}
      />
    </div>
  );
}
