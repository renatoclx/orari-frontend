import { ArrowLeft, CalendarCheck } from "lucide-react";
import { BOTTOM_NAV_OFFSET } from "@/components/client-app/AppBottomNav";
import { slotRange } from "@/components/client-app/booking-slots";
import { longDate } from "@/components/client-app/client-app";
import { PlaceAvatar } from "@/components/client-app/PlaceAvatar";
import { Button } from "@/components/ui/button";
import type { PlaceService } from "@/types/client-app";
import { formatDuration, formatPrice } from "@/utils/format";

type BookingReviewProps = {
  place: { name: string; logoUrl: string | null };
  service: PlaceService;
  professional: PlaceService["professionals"][number];
  /** Dia escolhido ("AAAA-MM-DD"). */
  date: string;
  /** Hora de início ("HH:mm", no relógio da clínica). */
  time: string;
  booking: boolean;
  onConfirm: () => void;
  onBack: () => void;
};

/**
 * Confirmação do Agendar (screens/app-cliente.md): o cliente confere onde, o
 * quê, com quem e quando antes de gravar. É uma etapa da própria página, e não
 * um diálogo: os diálogos ficam fora da área escura do app.
 */
export function BookingReview({
  place,
  service,
  professional,
  date,
  time,
  booking,
  onConfirm,
  onBack,
}: BookingReviewProps) {
  return (
    <section className="flex flex-1 flex-col gap-4">
      <h2 className="font-semibold">Confira o seu agendamento</h2>
      <dl className="divide-y divide-border rounded-card border border-border bg-card">
        <div className="flex items-center gap-3 p-4">
          <PlaceAvatar name={place.name} logoUrl={place.logoUrl} alt="" />
          <div className="min-w-0">
            <dt className="text-sm text-muted-foreground">Estabelecimento</dt>
            <dd className="font-medium">{place.name}</dd>
          </div>
        </div>
        <div className="p-4">
          <dt className="text-sm text-muted-foreground">Serviço</dt>
          <dd className="font-medium">{service.name}</dd>
          <dd className="text-sm text-muted-foreground tabular-nums">
            {formatDuration(service.duration)}
            {service.price !== null && ` · ${formatPrice(service.price)}`}
          </dd>
        </div>
        <div className="flex items-center gap-3 p-4">
          <PlaceAvatar
            name={professional.name}
            logoUrl={professional.photoUrl}
            alt=""
          />
          <div className="min-w-0">
            <dt className="text-sm text-muted-foreground">Profissional</dt>
            <dd className="font-medium">{professional.name}</dd>
          </div>
        </div>
        <div className="p-4">
          <dt className="text-sm text-muted-foreground">Dia e horário</dt>
          <dd className="font-medium first-letter:uppercase">
            {longDate(date)}
          </dd>
          <dd className="font-medium tabular-nums">
            {slotRange(time, service.duration)}
          </dd>
        </div>
      </dl>

      {/* Presos embaixo, logo acima da barra de navegação; a ação principal em cima. */}
      <div
        className={`sticky ${BOTTOM_NAV_OFFSET} -mx-5 mt-auto flex flex-col gap-2 border-t border-border bg-background px-5 py-3`}
      >
        <Button
          type="button"
          disabled={booking}
          onClick={onConfirm}
          className="h-12 w-full text-base"
        >
          <CalendarCheck aria-hidden="true" />
          {booking ? "Agendando…" : "Confirmar agendamento"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={booking}
          onClick={onBack}
          className="h-12 w-full text-base"
        >
          <ArrowLeft aria-hidden="true" />
          Voltar
        </Button>
      </div>
    </section>
  );
}
