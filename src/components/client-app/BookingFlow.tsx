"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronRight, ClipboardCheck, Pencil } from "lucide-react";
import { appAvailabilityAction, appBookAction } from "@/app/app/actions";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { BOTTOM_NAV_OFFSET } from "@/components/client-app/AppBottomNav";
import {
  groupSlotsByPeriod,
  slotsLabel,
  type Slot,
} from "@/components/client-app/booking-slots";
import { BookingReview } from "@/components/client-app/BookingReview";
import { bookingDays, longDate } from "@/components/client-app/client-app";
import { PlaceAvatar } from "@/components/client-app/PlaceAvatar";
import { DayStrip } from "@/components/shared/DayStrip";
import { Button } from "@/components/ui/button";
import type { PlaceService } from "@/types/client-app";
import { formatDuration, formatPrice } from "@/utils/format";

type BookingFlowProps = {
  slug: string;
  /** O estabelecimento, para o resumo da confirmação. */
  place: { name: string; logoUrl: string | null };
  services: PlaceService[];
  /** Serviço já escolhido (vindo da lista da página do local). */
  initialServiceId?: string;
  /** Hoje, no relógio da clínica (aaaa-mm-dd). */
  today: string;
  /** Até quantos dias à frente a clínica deixa agendar. */
  maxDaysAhead: number;
};

/**
 * Agendar pelo app (screens/app-cliente.md): serviço → profissional → dia →
 * horário → revisar e confirmar, numa página só que vai se completando. Mudar uma escolha
 * apaga as que dependem dela. Os horários vêm do servidor, com as regras da
 * clínica (antecedência, dias à frente, janelas e compromissos).
 */
export function BookingFlow({
  slug,
  place,
  services,
  initialServiceId,
  today,
  maxDaysAhead,
}: BookingFlowProps) {
  const initial = services.find((item) => item.id === initialServiceId);
  const [serviceId, setServiceId] = useState<string | undefined>(initial?.id);
  // Um profissional só: já vem escolhido.
  // Com o serviço escolhido (ex.: vindo da página do local), a lista fecha e o
  // passo seguinte já fica à vista; "Trocar" abre a lista de novo.
  const [changingService, setChangingService] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | undefined>(
    initial?.professionals.length === 1
      ? initial.professionals[0].id
      : undefined,
  );
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>();
  const [slot, setSlot] = useState<Slot>();
  const [message, setMessage] = useState<string>();
  // Etapa de confirmação: o resumo do que foi escolhido, antes de gravar.
  const [reviewing, setReviewing] = useState(false);
  const [reload, setReload] = useState(0);
  const [loading, startLoading] = useTransition();
  const [booking, startBooking] = useTransition();

  const service = services.find((item) => item.id === serviceId);
  const professional = service?.professionals.find(
    (person) => person.id === professionalId,
  );
  const days = bookingDays(today, maxDaysAhead);

  function chooseService(id: string) {
    const chosen = services.find((item) => item.id === id);
    setServiceId(id);
    setChangingService(false);
    // Um profissional só: já vem escolhido.
    setProfessionalId(
      chosen?.professionals.length === 1
        ? chosen.professionals[0].id
        : undefined,
    );
    setSlot(undefined);
    setMessage(undefined);
  }

  // Escolheu: leva à vista o próximo passo (as etapas aparecem abaixo da dobra).
  // Não roda na abertura, mesmo com o serviço vindo da URL.
  const opened = useRef(false);
  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      return;
    }
    const target = !serviceId
      ? null
      : professionalId
        ? "booking-day"
        : "booking-professional";
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth" });
  }, [serviceId, professionalId]);

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
      // Recusa (horário ocupado, limite do cliente): volta às escolhas, com o
      // motivo no topo.
      setReviewing(false);
      setMessage(result.message);
      // Alguém pegou o horário antes: busca os livres de novo.
      if (result.refresh) setReload((value) => value + 1);
    });
  }

  // Abre e fecha a confirmação sempre do topo da página.
  function showReview(open: boolean) {
    setReviewing(open);
    window.scrollTo({ top: 0 });
  }

  const groups = slots ? groupSlotsByPeriod(slots) : [];

  if (reviewing && service && professional && slot) {
    return (
      <BookingReview
        place={place}
        service={service}
        professional={professional}
        date={date}
        time={slot.time}
        booking={booking}
        onConfirm={confirm}
        onBack={() => showReview(false)}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {message && <AppFormMessage>{message}</AppFormMessage>}

      {service && !changingService ? (
        <section className="space-y-2">
          <h2 className="font-semibold">1 · Serviço</h2>
          {/* O serviço escolhido fica num cartão só; tocar nele abre a lista. */}
          <button
            type="button"
            onClick={() => setChangingService(true)}
            className="flex w-full items-center gap-3 rounded-card border border-primary bg-primary/10 px-4 py-4 text-left"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{service.name}</span>
              <span className="block text-sm text-muted-foreground tabular-nums">
                {formatDuration(service.duration)}
                {service.price !== null && ` · ${formatPrice(service.price)}`}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
              <Pencil className="size-4" aria-hidden="true" />
              Trocar
            </span>
          </button>
        </section>
      ) : (
        <section className="space-y-2">
          <h2 className="font-semibold">1 · Escolha o serviço</h2>
          {/* Cartões separados: a seta mostra que dá para tocar. */}
          <ul className="space-y-3">
            {services.map((item) => {
              const selected = item.id === serviceId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => chooseService(item.id)}
                    className={`flex w-full items-center gap-3 rounded-card border px-4 py-4 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted/50 active:bg-muted"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{item.name}</span>
                      <span className="block text-sm text-muted-foreground tabular-nums">
                        {formatDuration(item.duration)}
                      </span>
                    </span>
                    {item.price !== null && (
                      <span className="shrink-0 font-semibold tabular-nums">
                        {formatPrice(item.price)}
                      </span>
                    )}
                    {selected ? (
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-4" aria-hidden="true" />
                        <span className="sr-only">Escolhido</span>
                      </span>
                    ) : (
                      <ChevronRight
                        className="size-5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {service && (
        <section id="booking-professional" className="scroll-mt-4 space-y-2">
          <h2 className="font-semibold">2 · Profissional</h2>
          {/* Foto (ou iniciais) em círculo, como os estabelecimentos. A linha
              interna (`w-max mx-auto`) fica no centro enquanto cabe e, com
              muitos, rola de lado a partir do primeiro (um justify-center
              cortaria o começo). */}
          <div className="-mx-5 overflow-x-auto px-5 pt-1 pb-1">
            <div className="mx-auto flex w-max gap-3">
              {service.professionals.map((person) => {
                const selected = person.id === professionalId;
                return (
                  <button
                    key={person.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setProfessionalId(person.id);
                      setMessage(undefined);
                    }}
                    className="flex w-20 shrink-0 flex-col items-center gap-2 text-center"
                  >
                    <span className="relative">
                      <span
                        className={`block rounded-full ring-2 ring-offset-2 ring-offset-background transition-colors ${
                          selected ? "ring-primary" : "ring-transparent"
                        }`}
                      >
                        <PlaceAvatar
                          name={person.name}
                          logoUrl={person.photoUrl}
                          size="lg"
                          alt=""
                        />
                      </span>
                      {selected && (
                        <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                          <Check className="size-4" aria-hidden="true" />
                        </span>
                      )}
                    </span>
                    <span
                      className={`line-clamp-2 text-sm font-medium ${
                        selected ? "text-primary" : ""
                      }`}
                    >
                      {person.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {service && professionalId && (
        <section id="booking-day" className="scroll-mt-4 space-y-2">
          <h2 className="font-semibold">3 · Dia</h2>
          <DayStrip
            days={days}
            selected={date}
            today={today}
            className="-mx-5 px-5"
            onSelect={(day) => {
              setDate(day);
              setMessage(undefined);
            }}
          />
        </section>
      )}

      {service && professionalId && (
        <section className="space-y-3" aria-live="polite">
          <h2 className="font-semibold">
            4 · Horário{" "}
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

      {/* Revisar fica preso embaixo, logo acima da barra de navegação. */}
      {slot && service && (
        <div
          className={`sticky ${BOTTOM_NAV_OFFSET} -mx-5 mt-auto border-t border-border bg-background px-5 py-3`}
        >
          <Button
            type="button"
            onClick={() => showReview(true)}
            className="h-12 w-full text-base"
          >
            <ClipboardCheck aria-hidden="true" />
            Revisar agendamento
          </Button>
        </div>
      )}
    </div>
  );
}
