import Link from "next/link";
import { PlaceAvatar } from "@/components/client-app/PlaceAvatar";
import type { AppPlace } from "@/types/client-app";

/**
 * "Últimos acessos" do Início: os locais da conta em linha, com o logo em
 * destaque (anel na cor do app) e o nome embaixo. A ordem vem de
 * `recentPlaces` (agendamento mais recente primeiro).
 */
export function RecentPlaces({ places }: { places: AppPlace[] }) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">Últimos acessos</h2>
      {places.length > 0 ? (
        <ul className="-mx-5 flex [scrollbar-width:none] gap-4 overflow-x-auto px-5 pt-1 pb-2 [&::-webkit-scrollbar]:hidden">
          {places.map((place) => (
            <li key={place.slug} className="w-24 shrink-0">
              <Link
                href={`/app/local/${place.slug}`}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background">
                  <PlaceAvatar
                    name={place.name}
                    logoUrl={place.logoUrl}
                    size="xl"
                  />
                </span>
                <span className="line-clamp-2 text-sm">{place.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
          Você ainda não tem estabelecimentos. Encontre um em{" "}
          <Link
            href="/app/buscar"
            className="font-semibold text-primary hover:underline"
          >
            Buscar
          </Link>{" "}
          ou peça o link de acesso ao seu estabelecimento.
        </p>
      )}
    </section>
  );
}
