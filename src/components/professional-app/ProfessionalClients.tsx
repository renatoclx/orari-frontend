import { SearchX, Users } from "lucide-react";
import { ListSearch } from "@/components/shared/ListSearch";
import {
  getProfessionalMe,
  listProfessionalClients,
} from "@/services/app-pro.service";
import { AppPagination } from "./AppPagination";
import { ClientCard } from "./ClientCard";
import { pageCount } from "./professional-clients";

/**
 * Aba Clientes do profissional (screens/app-profissional.md): só os clientes
 * dele, em ordem alfabética, com busca pelo nome. Só consulta.
 */
export async function ProfessionalClients({
  term,
  page,
}: {
  term: string;
  page: number;
}) {
  const [me, result] = await Promise.all([
    getProfessionalMe(),
    listProfessionalClients(page, term || undefined),
  ]);
  const pages = pageCount(result.total, result.limit);
  const href = (target: number) => {
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    if (target > 1) params.set("pagina", String(target));
    const query = params.toString();
    return query ? `/app/clientes?${query}` : "/app/clientes";
  };

  return (
    <>
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <ListSearch
        basePath="/app/clientes"
        search={term}
        label="Buscar cliente pelo nome"
        placeholder="Pesquise pelo nome"
        size="lg"
      />

      {result.items.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {result.total === 1 ? "1 cliente" : `${result.total} clientes`}
          </p>
          <ul className="space-y-2">
            {result.items.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                timeZone={me.company.timezone}
              />
            ))}
          </ul>
          <AppPagination page={page} pages={pages} href={href} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          {term ? (
            <SearchX
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
          ) : (
            <Users
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <p className="font-semibold">
            {term ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          </p>
          <p className="text-sm text-muted-foreground">
            {term
              ? "Confira o nome e tente de novo."
              : "Seus clientes aparecem aqui depois do primeiro agendamento."}
          </p>
        </div>
      )}
    </>
  );
}
