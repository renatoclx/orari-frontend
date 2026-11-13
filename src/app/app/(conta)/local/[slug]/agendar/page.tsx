import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BookingFlow } from "@/components/client-app/BookingFlow";
import { ApiError } from "@/services/api";
import { getAccount } from "@/services/app-account.service";
import { getPlace, listPlaceServices } from "@/services/app-place.service";
import { getAppToken } from "@/services/app-session";
import type { PlaceShowcase } from "@/types/client-app";
import { toDateString } from "@/utils/time";

export const metadata: Metadata = { title: "Agendar" };

/**
 * Agendar num estabelecimento (screens/app-cliente.md). Só para quem já é
 * cliente dele: sem a conta, vai entrar e volta; sem ser cliente, volta à
 * página do estabelecimento (que oferece entrar nele).
 */
export default async function BookingPage({
  params,
  searchParams,
}: PageProps<"/app/local/[slug]/agendar">) {
  const { slug } = await params;
  const { servico } = await searchParams;
  const here = `/app/local/${slug}/agendar`;
  if (!(await getAppToken())) {
    redirect(`/app/entrar?voltar=${encodeURIComponent(here)}`);
  }

  let place: PlaceShowcase;
  try {
    place = await getPlace(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const [services, account] = await Promise.all([
    listPlaceServices(slug),
    getAccount(),
  ]);
  if (!account.places.some((item) => item.slug === slug)) {
    redirect(`/app/local/${slug}`);
  }

  return (
    <>
      <header className="space-y-1">
        <Link
          href={`/app/local/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {place.name}
        </Link>
        <h1 className="text-2xl font-semibold">Agendar</h1>
      </header>
      {services.length > 0 ? (
        <BookingFlow
          slug={slug}
          services={services}
          // Vindo da lista de serviços da página do local: já vem escolhido
          // (um id que não existe é ignorado).
          initialServiceId={typeof servico === "string" ? servico : undefined}
          today={toDateString(new Date(), place.timezone)}
          maxDaysAhead={place.rules.maxDaysAhead}
        />
      ) : (
        <p className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
          Este estabelecimento ainda não tem serviços para agendar pelo app.
        </p>
      )}
    </>
  );
}
