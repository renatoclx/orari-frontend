import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, Clock } from "lucide-react";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { JoinPlaceButton } from "@/components/client-app/JoinPlaceButton";
import { PlaceAvatar } from "@/components/client-app/PlaceAvatar";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { getAccount } from "@/services/app-account.service";
import { getPlace, listPlaceServices } from "@/services/app-place.service";
import { getAppToken } from "@/services/app-session";
import type { PlaceShowcase } from "@/types/client-app";
import { segmentLabel } from "@/utils/business-segment";
import { formatDuration, formatPrice } from "@/utils/format";

export const metadata: Metadata = { title: "Estabelecimento" };

/**
 * Página do estabelecimento (screens/app-cliente.md): a vitrine (logo,
 * segmento, cidade e serviços), aberta também sem a conta, porque é o endereço
 * que a clínica divulga. Quem ainda não é cliente entra por aqui.
 */
export default async function PlacePage({
  params,
  searchParams,
}: PageProps<"/app/local/[slug]">) {
  const { slug } = await params;
  const { entrou } = await searchParams;

  let place: PlaceShowcase;
  try {
    place = await getPlace(slug);
  } catch (error) {
    // Portal desligado, fora do plano ou inexistente: a API responde 404.
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const loggedIn = Boolean(await getAppToken());
  const [services, account] = await Promise.all([
    listPlaceServices(slug),
    loggedIn ? getAccount() : null,
  ]);
  const isClient = account?.places.some((item) => item.slug === slug) ?? false;
  const here = `/app/local/${slug}`;

  return (
    <>
      <header className="flex flex-col items-center gap-2 text-center">
        <PlaceAvatar name={place.name} logoUrl={place.logoUrl} size="lg" />
        <h1 className="text-2xl font-semibold">{place.name}</h1>
        <p className="text-sm text-muted-foreground">
          {[place.segment && segmentLabel(place.segment), place.city]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      {/* Fica na tela: explica o limite de agendamentos, não é só uma confirmação. */}
      {entrou && (
        <AppFormMessage tone="info" persistent>
          Pronto, você agora é cliente de {place.name}. Até o estabelecimento
          confirmar o seu cadastro, você pode ter até 2 agendamentos futuros.
        </AppFormMessage>
      )}

      {!loggedIn ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Entre ou crie sua conta para agendar aqui.
          </p>
          <Button asChild className="h-12 w-full text-base">
            <Link href={`/app/entrar?voltar=${encodeURIComponent(here)}`}>
              Entrar
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full text-base">
            <Link href={`/app/criar-conta?voltar=${encodeURIComponent(here)}`}>
              Criar conta
            </Link>
          </Button>
        </div>
      ) : isClient ? (
        services.length > 0 && (
          <Button asChild className="h-12 w-full text-base">
            <Link href={`${here}/agendar`}>
              <CalendarPlus aria-hidden="true" />
              Agendar
            </Link>
          </Button>
        )
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              Você ainda não é cliente daqui. Ao entrar, o estabelecimento
              recebe o seu nome e telefone.
            </p>
            <JoinPlaceButton slug={slug} />
          </div>
        </>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold">Serviços</h2>
        {services.length > 0 ? (
          <ul className="space-y-2">
            {services.map((service) => (
              <li
                key={service.id}
                className="rounded-card border border-border bg-card p-3"
              >
                <p className="font-medium">{service.name}</p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
                  <Clock className="size-4" aria-hidden="true" />
                  {formatDuration(service.duration)}
                  {service.price !== null && ` · ${formatPrice(service.price)}`}
                </p>
                {service.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
            Este estabelecimento ainda não tem serviços para agendar pelo app.
          </p>
        )}
      </section>
    </>
  );
}
