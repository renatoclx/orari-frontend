import { PeopleToolbar } from "@/components/people/PeopleToolbar";
import { PersonList } from "@/components/people/PersonList";
import type { PeopleKind } from "@/components/people/people-kinds";
import { TablePagination } from "@/components/shared/TablePagination";
import { listPeople } from "@/services/people.service";

const PAGE_SIZE = 10;

type PeopleListPageProps = {
  kind: PeopleKind;
  /** searchParams da rota (?q= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de pessoas de um tipo (clientes, funcionários ou profissionais):
// renderizada no servidor, com busca e página pela URL.
export async function PeopleListPage({
  kind,
  searchParams,
}: PeopleListPageProps) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const result = await listPeople({
    type: kind.type,
    name: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">{kind.plural}</h1>
      <PeopleToolbar kind={kind} search={search} />
      <PersonList
        kind={kind}
        people={result.items}
        search={search}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={kind.path}
            query={{ q: search || undefined }}
          />
        }
      />
    </div>
  );
}
