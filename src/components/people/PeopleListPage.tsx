import { PeopleToolbar } from "@/components/people/PeopleToolbar";
import { PersonList } from "@/components/people/PersonList";
import type { PeopleKind } from "@/components/people/people-kinds";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import { listPeople } from "@/services/people.service";
import { canAccess } from "@/utils/access";

// Itens por página da listagem (a API aceita até 100).
const PAGE_SIZE = 10;

type PeopleListPageProps = {
  kind: PeopleKind;
  /** searchParams da rota (?q=, ?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de pessoas de um tipo (clientes, funcionários ou profissionais):
// renderizada no servidor, com busca, status e página pela URL.
export async function PeopleListPage({
  kind,
  searchParams,
}: PeopleListPageProps) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const status =
    searchParams.status === "active" || searchParams.status === "inactive"
      ? searchParams.status
      : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [result, user] = await Promise.all([
    listPeople({
      type: kind.type,
      name: search || undefined,
      isActive: status && status === "active",
      page,
      limit: PAGE_SIZE,
    }),
    getCurrentUser(),
  ]);
  // Clientes, com o Portal do cliente no plano: "Acesso ao portal" na coluna Ações.
  const portal =
    kind.type === "CLIENT" && canAccess(user.access, "client-portal")
      ? { companyName: user.company.name, timeZone: user.company.timezone }
      : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">{kind.plural}</h1>
      <PeopleToolbar kind={kind} search={search} status={status ?? "all"} />
      <PersonList
        kind={kind}
        people={result.items}
        search={search}
        filtered={Boolean(status)}
        portal={portal}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={kind.path}
            query={{ q: search || undefined, status }}
          />
        }
      />
    </div>
  );
}
