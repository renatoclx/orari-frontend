"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ban,
  ChevronDown,
  Package,
  Repeat,
  UserRound,
  UsersRound,
} from "lucide-react";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatPrice } from "@/utils/format";
import {
  ORIGIN_LABEL,
  type AgendaEntry,
  type AgendaOrigin,
} from "./professional-agenda";

// Ícone de cada origem (o encaixe não tem); o texto vem de ORIGIN_LABEL.
const ORIGIN_ICON: Partial<Record<AgendaOrigin, typeof Repeat>> = {
  package: Package,
  recurring: Repeat,
};

// Cor do serviço na borda e como fundo suave, como o bloco da agenda da clínica.
// Sem cor cadastrada, os tokens neutros.
function colorStyle(color: string | null, faded: boolean) {
  if (!color) return undefined;
  return {
    borderLeftColor: color,
    backgroundColor: `color-mix(in srgb, ${color} ${faded ? 6 : 14}%, transparent)`,
  };
}

/**
 * Uma linha da agenda do dia (screens/app-profissional.md). Tocar abre os
 * detalhes no próprio cartão: as janelas de diálogo da clínica ficam fora da
 * área escura do app, então o app não as usa. Só consulta.
 */
export function AgendaEntryCard({ entry }: { entry: AgendaEntry }) {
  const [open, setOpen] = useState(false);

  if (entry.kind === "block") {
    return (
      <li className="flex items-center gap-3 rounded-card border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        <Ban className="size-4 shrink-0" aria-hidden="true" />
        <span className="tabular-nums">
          {entry.start} – {entry.end}
        </span>
        <span>Horário bloqueado</span>
      </li>
    );
  }

  const isClass = entry.kind === "class";
  const status = isClass ? undefined : APPOINTMENT_STATUS[entry.status];
  const StatusIcon = status?.icon;
  // Cancelado e falta ficam esmaecidos; o concluído também, como na clínica.
  const faded = isClass
    ? entry.cancelled
    : ["CANCELLED", "NO_SHOW", "COMPLETED"].includes(entry.status);
  const origin = !isClass ? entry.origin : null;
  const OriginIcon = origin ? ORIGIN_ICON[origin] : undefined;
  const title = isClass ? entry.serviceName : entry.clientName;
  const subtitle = isClass
    ? `Turma · ${entry.occupied}/${entry.capacity}`
    : entry.serviceName;

  return (
    <li
      className={`overflow-hidden rounded-card border border-l-4 border-border bg-card ${
        faded ? "opacity-60" : ""
      }`}
      style={colorStyle(entry.serviceColor, faded)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">
          {entry.start}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate font-semibold ${
              !isClass && entry.status === "CANCELLED" ? "line-through" : ""
            }`}
          >
            {title}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {isClass && <UsersRound className="size-4" aria-hidden="true" />}
            <span className="truncate">{subtitle}</span>
          </span>
          {isClass && entry.cancelled && (
            <span className="text-sm text-destructive">Sessão cancelada</span>
          )}
          {status && StatusIcon && (
            <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <StatusIcon className="size-4" aria-hidden="true" />
              {status.label}
            </span>
          )}
        </span>
        <ChevronDown
          className={`mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="space-y-2 border-t border-border px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            {entry.start} – {entry.end}
          </p>
          {entry.kind === "appointment" ? (
            <>
              {/* A ficha do cliente (telefone e histórico dele com o profissional). */}
              <Link
                href={`/app/clientes/${entry.clientId}`}
                className="flex h-12 items-center justify-center gap-2 rounded-control border border-border text-base font-medium"
              >
                <UserRound className="size-4" aria-hidden="true" />
                Ver cliente
              </Link>
              <p>
                <span className="font-medium">{entry.serviceName}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {formatDuration(entry.duration)}
                  {entry.price !== null && ` · ${formatPrice(entry.price)}`}
                </span>
              </p>
              {origin && (
                <Badge variant="secondary">
                  {OriginIcon && (
                    <OriginIcon className="size-3" aria-hidden="true" />
                  )}
                  {ORIGIN_LABEL[origin]}
                </Badge>
              )}
              {entry.note && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Observação:{" "}
                  </span>
                  {entry.note}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                {entry.occupied} de {entry.capacity} vagas ocupadas
              </p>
              <ul className="space-y-1">
                {entry.members.map((member) => {
                  const memberStatus = APPOINTMENT_STATUS[member.status];
                  return (
                    <li
                      key={member.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span
                        className={
                          member.status === "CANCELLED" ? "line-through" : ""
                        }
                      >
                        {member.name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <memberStatus.icon
                          className="size-4"
                          aria-hidden="true"
                        />
                        {memberStatus.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </li>
  );
}
