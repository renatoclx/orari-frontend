import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { AnamnesisClientsList } from "@/components/anamnesis/records/AnamnesisClientsList";
import { ListSearch } from "@/components/shared/ListSearch";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { requireAnamnesisAccess } from "@/lib/anamnesis-guard";
import { listAnamnesisClients } from "@/services/anamnesis.service";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/anamnese/fichas";

type AnamnesisClientsPageProps = {
  /** searchParams da rota (?q= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Fichas preenchidas: quem já tem ficha e quantas, com a busca por nome e a
 * entrada para criar uma ficha nova. Renderizada no servidor (sem cache).
 */
export async function AnamnesisClientsPage({
  searchParams,
}: AnamnesisClientsPageProps) {
  await requireAnamnesisAccess();

  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const result = await listAnamnesisClients({
    name: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Fichas preenchidas</h1>
      <div className="flex flex-wrap items-center gap-3">
        <ListSearch
          basePath={BASE_PATH}
          search={search}
          label="Buscar cliente por nome"
        />
        <Button asChild className="w-full sm:ml-auto sm:w-auto">
          <Link href={`${BASE_PATH}/nova`}>
            <FilePlus2 aria-hidden="true" />
            Nova ficha
          </Link>
        </Button>
      </div>
      <AnamnesisClientsList
        clients={result.items}
        filtered={Boolean(search)}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={{ q: search || undefined }}
          />
        }
      />
    </div>
  );
}
