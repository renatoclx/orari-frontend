import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";
import { PlaceAvatar } from "@/components/client-app/PlaceAvatar";
import { ListSearch } from "@/components/shared/ListSearch";
import { searchDirectory } from "@/services/app-place.service";
import { segmentLabel } from "@/utils/business-segment";

export const metadata: Metadata = { title: "Buscar" };

// A API pede ao menos 2 letras (uma só traria tudo).
const MIN_TERM = 2;

/**
 * Buscar estabelecimentos pelo nome (screens/app-cliente.md). Só aparecem os
 * que ligaram "Aparecer na busca". A busca acontece durante a digitação.
 */
export default async function AppSearchPage({
  searchParams,
}: PageProps<"/app/buscar">) {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim() : "";
  const results = term.length >= MIN_TERM ? await searchDirectory(term) : null;

  return (
    <>
      <h1 className="text-2xl font-semibold">Buscar</h1>
      <ListSearch
        basePath="/app/buscar"
        search={term}
        label="Buscar estabelecimento pelo nome"
        placeholder="Pesquise pelo nome"
        size="lg"
      />

      {results === null ? (
        <p className="text-center text-sm text-muted-foreground">
          Encontre um estabelecimento pelo nome.
        </p>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
          <SearchX className="size-8" aria-hidden="true" />
          Nenhum estabelecimento encontrado para “{term}”.
        </div>
      ) : (
        <ul className="space-y-2">
          {results.map((place) => (
            <li key={place.slug}>
              <Link
                href={`/app/local/${place.slug}`}
                className="flex items-center gap-3 rounded-card border border-border bg-card p-3 hover:bg-accent"
              >
                <PlaceAvatar name={place.name} logoUrl={place.logoUrl} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {place.name}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {[segmentLabel(place.segment), place.city]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
