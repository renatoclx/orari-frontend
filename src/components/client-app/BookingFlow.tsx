"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarCheck, Clock } from "lucide-react";
import { appAvailabilityAction, appBookAction } from "@/app/app/actions";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { BOTTOM_NAV_OFFSET } from "@/components/client-app/AppBottomNav";
import {
  groupSlotsByPeriod,
  slotsLabel,
  type Slot,
} from "@/components/client-app/booking-slots";
import {
  bookingDays,
  dayChip,
  longDate,
} from "@/components/client-app/client-app";
import { Button } from "@/components/ui/button";
import type { PlaceService } from "@/types/client-app";
import { formatDuration, formatPrice } from "@/utils/format";

type BookingFlowProps = {
  slug: string;
  services: PlaceService[];
  /** Hoje, no relógio da clínica (aaaa-mm-dd). */
  today: string;
  /** Até quantos dias à frente a clínica deixa agendar. */
  maxDaysAhead: number;
};

// Botão de escolha (serviço, profissional, dia, horário): contorno azul e,
// escolhido, preenchido, como no esboço aprovado.
const choiceClass = (selected: boolean) =>
  `rounded-control border text-left transition-colors ${
    selected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card hover:border-primary"
  }`;

/**
 * Agendar pelo app (screens/app-cliente.md): serviço → profissional → dia →
 * horário → confirmar, numa página só que vai se completando. Mudar uma escolha
 * apaga as que dependem dela. Os horários vêm do servidor, com as regras da
 * clínica (antecedência, dias à frente, janelas e compromissos).
 */
export function BookingFlow({
  slug,
  services,
  today,
  maxDaysAhead,
}: BookingFlowProps) {
  const [serviceId, setServiceId] = useState<string>();
  const [professionalId, setProfessionalId] = useState<string>();
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>();
  const [slot, setSlot] = useState<Slot>();
  const [message, setMessage] = useState<string>();
  const [reload, setReload] = useState(0);
  const [loading, startLoading] = useTransition();
  const [booking, startBooking] = useTransition();

  const service = services.find((item) => item.id === serviceId);
  const days = bookingDays(today, maxDaysAhead);

  function chooseService(id: string) {
    const chosen = services.find((item) => item.id === id);
    setServiceId(id);
    // Um profissional só: já vem escolhido.
    setProfessionalId(
      chosen?.professionals.length === 1
        ? chosen.professionals[0].id
        : undefined,
    );
    setSlot(undefined);
    setMessage(undefined);
  }

  // Busca os horários quando serviço, profissional e dia estão escolhidos.
  useEffect(() => {
    if (!serviceId || !professionalId) return;
    startLoading(async () => {
      setSlot(undefined);
      const result = await appAvailabilityAction(slug, {
        serviceId,
        professionalId,
        date,
      });
      if (result.ok) setSlots(result.slots);
      else {
        setSlots([]);
        setMessage(result.message);
      }
    });
  }, [slug, serviceId, professionalId, date, reload]);

  function confirm() {
    if (!serviceId || !professionalId || !slot) return;
    startBooking(async () => {
      const result = await appBookAction(slug, {
        serviceId,
        professionalId,
        startAt: slot.startAt,
      });
      if (!result) return;
      setMessage(result.message);
      // Alguém pegou o horário antes: busca os livres de novo.
      if (result.refresh) setReload((value) => value + 1);
    });
  }

  const groups = slots ? groupSlotsByPeriod(slots) : [];

  return (
    <div className="flex flex-1 flex-col gap-6">
      {message && <AppFormMessage>{message}</AppFormMessage>}

      <section className="space-y-2">
        <h2 className="font-semibold">Serviço</h2>
        <ul className="space-y-2">
          {services.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={item.id === serviceId}
                onClick={() => chooseService(item.id)}
                className={`${choiceClass(item.id === serviceId)} w-full p-3`}
              >
                <span className="block font-medium">{item.name}</span>
                <span
                  className={`flex items-center gap-1.5 text-sm tabular-nums ${
                    item.id === serviceId
                      ? "text-primary-foreground/85"
                      : "text-muted-foreground"
                  }`}
                >
                  <Clock className="size-4" aria-hidden="true" />
                  {formatDuration(item.duration)}
                  {item.price !== null && ` · ${formatPrice(item.price)}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {service && (
        <section className="space-y-2">
          <h2 className="font-semibold">Profissional</h2>
          <div className="flex flex-wrap gap-2">
            {service.professionals.map((person) => (
              <button
                key={person.id}
                type="button"
                aria-pressed={person.id === professionalId}
                onClick={() => {
                  setProfessionalId(person.id);
                  setMessage(undefined);
                }}
                className={`${choiceClass(person.id === professionalId)} px-4 py-2.5 text-sm font-medium`}
              >
                {person.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {service && professionalId && (
        <section className="space-y-2">
          <h2 className="font-semibold">Dia</h2>
          {/* Faixa que rola de lado, como no AppBarber. */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {days.map((day) => {
              const chip = dayChip(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={day === date}
                  aria-label={longDate(day)}
                  onClick={() => {
                    setDate(day);
                    setMessage(undefined);
                  }}
                  className={`${choiceClass(day === date)} flex w-14 shrink-0 flex-col items-center py-2 text-center`}
                >
                  <span className="text-xs">{chip.weekday}</span>
                  <span className="text-lg font-semibold tabular-nums">
                    {chip.day}
                  </span>
                  <span className="text-xs">{chip.month}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {service && professionalId && (
        <section className="space-y-3" aria-live="polite">
          <h2 className="font-semibold">
            Horário{" "}
            <span className="font-normal text-muted-foreground">
              · {longDate(date)}
            </span>
          </h2>
          {loading || !slots ? (
            <p className="text-sm text-muted-foreground">Buscando horários…</p>
          ) : groups.length === 0 ? (
            <p className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
              Nenhum horário livre neste dia. Escolha outro dia.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.period} className="space-y-2">
                <div className="flex items-baseline justify-between border-t border-border pt-2">
                  <h3 className="text-sm font-semibold">{group.label}</h3>
                  <span className="text-sm text-muted-foreground">
                    {slotsLabel(group.slots.length)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {group.slots.map((item) => {
                    const selected = item.startAt === slot?.startAt;
                    return (
                      <button
                        key={item.startAt}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setSlot(item);
                          setMessage(undefined);
                        }}
                        className={`rounded-control border py-2 text-center font-semibold tabular-nums transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-primary text-primary hover:bg-primary/10"
                        }`}
                      >
                        {item.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Confirmar fica preso embaixo, logo acima da barra de navegação. */}
      {slot && service && (
        <div
          className={`sticky ${BOTTOM_NAV_OFFSET} -mx-4 mt-auto border-t border-border bg-background px-4 py-3`}
        >
          <Button
            type="button"
            disabled={booking}
            onClick={confirm}
            className="h-12 w-full text-base"
          >
            <CalendarCheck aria-hidden="true" />
            {booking
              ? "Agendando…"
              : `Confirmar ${dayChip(date).weekday}, ${dayChip(date).day}/${date.slice(5, 7)} às ${slot.time}`}
          </Button>
        </div>
      )}
    </div>
  );
}
