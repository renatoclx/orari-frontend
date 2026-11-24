import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { appointmentWhen } from "@/components/client-app/client-app";
import type { FeaturedAppointment } from "@/components/client-app/home-feed";
import { PlaceAvatar } from "@/components/client-app/PlaceAvatar";

/**
 * Card do Início: o próximo agendamento (leva a Agendamentos) ou, sem nenhum
 * marcado, o último, com o atalho para agendar de novo no mesmo local.
 */
export function FeaturedAppointmentCard({
  featured,
}: {
  featured: FeaturedAppointment;
}) {
  const { kind, appointment } = featured;
  const { place } = appointment;
  const isNext = kind === "next";

  const body = (
    <>
      <PlaceAvatar name={place.name} logoUrl={place.logoUrl} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{place.name}</span>
        <span className="block truncate text-sm text-muted-foreground">
          {appointment.service.name}
        </span>
        <span className="block truncate text-sm text-muted-foreground">
          {appointmentWhen(appointment.startAt, place.timezone)}, com{" "}
          {appointment.professional.name}
        </span>
      </span>
    </>
  );

  return (
    <section className="space-y-2">
      <h2 className="font-semibold">
        {isNext ? "Próximo agendamento" : "Último agendamento"}
      </h2>
      <div className="space-y-3 rounded-card border border-primary/60 bg-card p-3">
        <Link
          href={isNext ? "/app/agendamentos" : `/app/local/${place.slug}`}
          className="flex min-w-0 items-center gap-3"
        >
          {body}
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-primary">
            <ChevronRight className="size-5" aria-hidden="true" />
            <span className="sr-only">
              {isNext ? "Ver agendamentos" : `Ver ${place.name}`}
            </span>
          </span>
        </Link>
        {/* O último: atalho para marcar de novo no mesmo local, numa linha
            própria para não apertar o serviço e a data. */}
        {!isNext && (
          <Link
            href={`/app/local/${place.slug}/agendar`}
            className="flex h-10 items-center justify-center rounded-full border border-primary text-sm font-semibold text-primary hover:bg-primary/10"
          >
            Agendar de novo
          </Link>
        )}
      </div>
    </section>
  );
}
