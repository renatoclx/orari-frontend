import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { PlaceAvatar } from "@/components/client-app/PlaceAvatar";
import {
  DEFAULT_TIME_ZONE,
  appointmentWhen,
  firstName,
  greetingDate,
} from "@/components/client-app/client-app";
import {
  getAccount,
  listAccountAppointments,
} from "@/services/app-account.service";

export const metadata: Metadata = { title: "Início" };

/**
 * Início do app (screens/app-cliente.md): saudação com a data, o próximo
 * agendamento (de qualquer estabelecimento) e os estabelecimentos da conta.
 */
export default async function AppHomePage({ searchParams }: PageProps<"/app">) {
  const { bemVindo } = await searchParams;
  const [{ account, places }, { upcoming }] = await Promise.all([
    getAccount(),
    listAccountAppointments(),
  ]);
  const next = upcoming[0];
  // A data da saudação no fuso do primeiro estabelecimento (todos no Brasil).
  const timeZone = places[0]?.timezone ?? DEFAULT_TIME_ZONE;

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold">
          Olá <span className="text-primary">{firstName(account.name)}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {greetingDate(new Date(), timeZone)}
        </p>
      </header>

      {bemVindo && (
        <AppFormMessage tone="info">
          Conta criada. Boas-vindas ao Orari!
        </AppFormMessage>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold">Próximo agendamento</h2>
        {next ? (
          <div className="flex items-start gap-3 rounded-card border border-border bg-card p-4">
            <CalendarClock
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{next.service.name}</p>
              <p className="text-muted-foreground">
                {appointmentWhen(next.startAt, next.place.timezone)} ·{" "}
                {next.professional.name}
              </p>
              <p className="text-muted-foreground">{next.place.name}</p>
            </div>
          </div>
        ) : (
          <p className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
            Nenhum agendamento marcado.
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Meus locais</h2>
        {places.length > 0 ? (
          <ul className="space-y-2">
            {places.map((place) => (
              <li key={place.slug}>
                <Link
                  href={`/app/local/${place.slug}`}
                  className="flex items-center gap-3 rounded-card border border-border bg-card p-3 hover:bg-accent"
                >
                  <PlaceAvatar name={place.name} logoUrl={place.logoUrl} />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {place.name}
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
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
    </>
  );
}
