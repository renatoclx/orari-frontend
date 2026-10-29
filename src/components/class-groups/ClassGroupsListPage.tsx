import { notFound } from "next/navigation";
import { ClassGroupList } from "@/components/class-groups/ClassGroupList";
import { ClassGroupsToolbar } from "@/components/class-groups/ClassGroupsToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import { listClassGroups } from "@/services/class-group.service";
import { listPeople } from "@/services/people.service";
import { timeToMinutes, toDateString, toTimeString } from "@/utils/time";

// Itens por página da listagem (a API aceita até 100).
const PAGE_SIZE = 10;
const BASE_PATH = "/turmas";

type ClassGroupsListPageProps = {
  /** searchParams da rota (?q=, ?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de turmas (só ADMIN; os demais veem 404, e a API recusa com 403):
// renderizada no servidor, com busca, status e página pela URL.
export async function ClassGroupsListPage({
  searchParams,
}: ClassGroupsListPageProps) {
  const currentUser = await getCurrentUser();
  if (currentUser.type !== "ADMIN") notFound();

  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const status =
    searchParams.status === "active" || searchParams.status === "inactive"
      ? searchParams.status
      : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const now = new Date();
  const timeZone = currentUser.company.timezone;
  const [result, clients] = await Promise.all([
    listClassGroups({
      name: search || undefined,
      isActive: status && status === "active",
      page,
      limit: PAGE_SIZE,
    }),
    // RASCUNHO: primeiros 100 clientes; o "Adicionar alunos" busca o restante pelo nome.
    listPeople({ type: "CLIENT", page: 1, limit: 100 }),
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Turmas</h1>
      <ClassGroupsToolbar search={search} status={status ?? "all"} />
      <ClassGroupList
        classGroups={result.items}
        filtered={Boolean(search || status)}
        clients={clients.items
          .filter((item) => item.deletedAt === null)
          .map((item) => ({ id: item.id, name: item.name }))}
        today={toDateString(now, timeZone)}
        nowMinutes={timeToMinutes(toTimeString(now.toISOString(), timeZone))}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={{ q: search || undefined, status }}
          />
        }
      />
    </div>
  );
}
