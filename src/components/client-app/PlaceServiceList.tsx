import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PlaceService } from "@/types/client-app";
import { formatDuration, formatPrice } from "@/utils/format";

/**
 * Serviços do estabelecimento como uma lista de linhas num quadro só
 * (screens/app-cliente.md). Com `bookingHref`, cada linha é um link que abre o
 * Agendar já com o serviço escolhido, e a seta à direita mostra que dá para
 * tocar. Sem ele (quem ainda não é cliente), é só informação: sem seta e sem
 * toque, para não parecer botão.
 */
export function PlaceServiceList({
  services,
  bookingHref,
}: {
  services: PlaceService[];
  /** Caminho do Agendar; recebe o serviço em `?servico=`. */
  bookingHref?: string;
}) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
      {services.map((service) => {
        const content = (
          <>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{service.name}</span>
              <span className="block text-sm text-muted-foreground tabular-nums">
                {formatDuration(service.duration)}
              </span>
              {service.description && (
                <span className="mt-1 block text-sm text-muted-foreground">
                  {service.description}
                </span>
              )}
            </span>
            {service.price !== null && (
              <span className="shrink-0 font-semibold tabular-nums">
                {formatPrice(service.price)}
              </span>
            )}
            {bookingHref && (
              <ChevronRight
                className="size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
            )}
          </>
        );
        const rowClass = "flex items-center gap-3 px-4 py-3.5";
        return (
          <li key={service.id}>
            {bookingHref ? (
              <Link
                href={`${bookingHref}?servico=${encodeURIComponent(service.id)}`}
                aria-label={`Agendar ${service.name}`}
                className={`${rowClass} hover:bg-muted/50 active:bg-muted`}
              >
                {content}
              </Link>
            ) : (
              <div className={rowClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
