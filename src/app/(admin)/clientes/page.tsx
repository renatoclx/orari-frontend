import type { Metadata } from "next";
import { ClientList } from "@/components/clients/ClientList";
import { ClientsToolbar } from "@/components/clients/ClientsToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { listPeople } from "@/services/people.service";

export const metadata: Metadata = {
  title: "Clientes | Orari",
};

const PAGE_SIZE = 10;

export default async function ClientsPage({
  searchParams,
}: PageProps<"/clientes">) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);

  const result = await listPeople({
    type: "CLIENT",
    name: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <ClientsToolbar search={search} />
      <ClientList
        clients={result.items}
        search={search}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath="/clientes"
            query={{ q: search || undefined }}
          />
        }
      />
    </div>
  );
}
