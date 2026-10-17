import { RecurrenceList } from "@/components/recurrences/RecurrenceList";
import { RecurrencesToolbar } from "@/components/recurrences/RecurrencesToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { listPeople } from "@/services/people.service";
import { listRecurrences } from "@/services/recurrence.service";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/recorrencias";

type RecurrencesListPageProps = {
  /** searchParams da rota (?professional=, ?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de recorrências: renderizada no servidor, com filtros e página pela URL.
export async function RecurrencesListPage({
  searchParams,
}: RecurrencesListPageProps) {
  const professionalId =
    typeof searchParams.professional === "string"
      ? searchParams.professional
      : undefined;
  const status =
    searchParams.status === "active" || searchParams.status === "inactive"
      ? searchParams.status
      : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [result, people] = await Promise.all([
    listRecurrences({
      professionalId,
      isActive: status && status === "active",
      page,
      limit: PAGE_SIZE,
    }),
    listPeople({ type: "PROFESSIONAL", page: 1, limit: 100 }),
  ]);

  const professionals = people.items
    .filter((person) => person.deletedAt === null)
    .map((person) => ({ id: person.id, name: person.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Recorrências</h1>
      <RecurrencesToolbar
        professionals={professionals}
        professionalId={professionalId ?? "all"}
        status={status ?? "all"}
      />
      <RecurrenceList
        recurrences={result.items}
        filtered={Boolean(professionalId || status)}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={{ professional: professionalId, status }}
          />
        }
      />
    </div>
  );
}
