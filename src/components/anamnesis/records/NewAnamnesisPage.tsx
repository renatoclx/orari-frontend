import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientPicker } from "@/components/anamnesis/records/ClientPicker";
import { NewAnamnesisForm } from "@/components/anamnesis/records/NewAnamnesisForm";
import { requireAnamnesisAccess } from "@/lib/anamnesis-guard";
import { ApiError } from "@/services/api";
import { listAnamneses } from "@/services/anamnesis.service";
import { listTemplates } from "@/services/anamnesis-template.service";
import { getPerson, listPeople } from "@/services/people.service";
import { anamnesisAccess } from "@/utils/anamnesis-access";
import { toDateString } from "@/utils/time";

type NewAnamnesisPageProps = {
  /** Cliente da URL (`?clienteId=`), se já escolhido. */
  clientId?: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Nova ficha: escolhe o cliente e, com ele, mostra o formulário com os modelos
 * que ele ainda não usou. Serve ao menu Anamnese e ao botão da aba do cliente
 * (que chega com o cliente já escolhido).
 */
export async function NewAnamnesisPage({ clientId }: NewAnamnesisPageProps) {
  const user = await requireAnamnesisAccess();
  const initialClients = await listPeople({
    type: "CLIENT",
    isActive: true,
    page: 1,
    limit: 20,
  });

  // Cliente da URL: inexistente (ou de outro tipo) é 404; inativo não recebe ficha.
  const client = clientId
    ? UUID.test(clientId)
      ? await getPerson(clientId).catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 404) notFound();
          throw error;
        })
      : notFound()
    : undefined;
  if (client && client.type !== "CLIENT") notFound();
  const inactive = client !== undefined && client.deletedAt !== null;

  let form: React.ReactNode = null;
  if (client && !inactive) {
    // Modelos ativos que o cliente ainda não usou (uma ficha por cliente e modelo).
    const [templates, used] = await Promise.all([
      listTemplates({ isActive: true, page: 1, limit: 100 }),
      listAnamneses({ clientId: client.id, page: 1, limit: 100 }),
    ]);
    const usedIds = new Set(used.items.map((item) => item.template.id));
    const available = templates.items
      .filter((item) => !usedIds.has(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        questions: item.currentVersion.questions,
      }));

    form =
      available.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-card border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {templates.items.length === 0 ? (
            // Nenhum modelo ativo na empresa: não depende do cliente.
            <>
              <p>
                Não há modelo de ficha ativo. Cadastre ou ative um modelo para
                criar fichas.
              </p>
              {anamnesisAccess(user).isAdmin && (
                <Link
                  href="/anamnese/modelos"
                  className="font-medium text-primary hover:underline"
                >
                  Ver modelos de ficha
                </Link>
              )}
            </>
          ) : (
            // Há modelos ativos, mas o cliente já tem ficha de todos (uma por modelo).
            <>
              <p>
                Este cliente já tem ficha de todos os modelos ativos. Para
                registrar a evolução, abra a ficha dele e use{" "}
                <strong>Novo acompanhamento</strong>.
              </p>
              <Button asChild variant="outline">
                <Link href={`/clientes/${client.id}?aba=anamnese`}>
                  Ver fichas do cliente
                </Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <NewAnamnesisForm
          // O cliente na chave: outro cliente, formulário novo e limpo.
          key={client.id}
          client={{ id: client.id, name: client.name }}
          templates={available}
          today={toDateString(new Date(), user.company.timezone)}
        />
      );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <Link
          href="/anamnese/fichas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Fichas preenchidas
        </Link>
        <h1 className="text-2xl font-semibold">Nova ficha</h1>
        <p className="text-sm text-muted-foreground">
          Escolha o cliente e o modelo para registrar a anamnese.
        </p>
      </div>

      <div className="max-w-md">
        <ClientPicker
          initial={initialClients.items.map((item) => ({
            id: item.id,
            name: item.name,
          }))}
          picked={client && { id: client.id, name: client.name }}
        />
        {inactive && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            Cliente inativo não recebe novas fichas.
          </p>
        )}
      </div>

      {form}
    </div>
  );
}
