import { CalendarClock, ChevronsUpDown, Plus } from "lucide-react";
import { Hint } from "@/components/shared/Hint";
import { AppointmentBlock } from "@/components/agenda/AppointmentBlock";
import type { GridRange } from "@/components/agenda/agenda-range";
import type {
  AgendaAppointment,
  AgendaProfessional,
  TimeRange,
} from "@/types/agenda";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { minutesToTime, timeToMinutes } from "@/utils/time";

// Altura de cada intervalo de 30 minutos.
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 48;
const PX_PER_MINUTE = SLOT_HEIGHT / SLOT_MINUTES;

// "closed": fora do expediente (aceita encaixe). "gap": dentro do expediente,
// entre duas janelas de atendimento (não aceita agendamento nem encaixe).
type SlotState = "free" | "past" | "closed" | "gap" | "occupied";

type DayGridProps = {
  professionals: AgendaProfessional[];
  appointments: AgendaAppointment[];
  /** Janela visível, em minutos desde a meia-noite. */
  range: GridRange;
  /** Trechos fora do expediente, hachurados. */
  unavailable: TimeRange[];
  /** Intervalos entre janelas de atendimento (almoço), em cinza. */
  breaks: TimeRange[];
  /** "HH:mm" do momento atual; nulo quando o dia exibido não é hoje. */
  now: string | null;
  /**
   * No celular, só a coluna deste profissional aparece (as demais ficam
   * ocultas por CSS). Sem isso, todas aparecem em qualquer tela.
   */
  mobileProfessionalId?: string;
  /** Troca do profissional exibido no celular (menu ao lado do nome). */
  onMobileProfessionalChange?: (professionalId: string) => void;
  /**
   * Minutos do dia antes dos quais já passou (o dia todo para dias passados,
   * o horário atual para hoje, 0 para dias futuros). Não se agenda no passado.
   */
  pastMinutes: number;
  /**
   * Profissionais exibidos no computador (padrão ou filtro). As demais colunas
   * ficam ocultas só ali: o celular continua com um profissional por vez.
   */
  desktopVisibleIds: string[];
  /** Clique em um intervalo livre. */
  onSlotSelect?: (professionalId: string, time: string) => void;
  /** Clique em um intervalo que já passou: não aceita agendamento. */
  onSlotPast?: () => void;
  /** Clique em um intervalo dentro do expediente, entre janelas de atendimento. */
  onSlotGap?: () => void;
  /** Clique em um intervalo fora do funcionamento: abre o encaixe. */
  onSlotOverbooking?: (professionalId: string, time: string) => void;
  /** Clique em um agendamento. */
  onAppointmentSelect?: (appointment: AgendaAppointment) => void;
};

/** Grade do dia: uma coluna por profissional, com expediente e agendamentos. */
export function DayGrid({
  professionals,
  appointments,
  range,
  unavailable,
  breaks,
  now,
  mobileProfessionalId,
  onMobileProfessionalChange,
  pastMinutes,
  desktopVisibleIds,
  onSlotSelect,
  onSlotPast,
  onSlotGap,
  onSlotOverbooking,
  onAppointmentSelect,
}: DayGridProps) {
  // Colunas dos outros profissionais somem no celular, quando há um escolhido.
  const mobileHidden = (professionalId: string) =>
    mobileProfessionalId !== undefined &&
    professionalId !== mobileProfessionalId
      ? "max-md:hidden"
      : "";
  // Fora do padrão ou do filtro: a coluna some do computador.
  const desktopHidden = (professionalId: string) =>
    desktopVisibleIds.includes(professionalId) ? "" : "md:hidden";
  const firstVisibleId = professionals.find((item) =>
    desktopVisibleIds.includes(item.id),
  )?.id;
  const gridHeight = (range.end - range.start) * PX_PER_MINUTE;
  // Um horário por intervalo, para as linhas e os rótulos da grade.
  const slots = Array.from(
    { length: Math.ceil((range.end - range.start) / SLOT_MINUTES) },
    (_, index) => range.start + index * SLOT_MINUTES,
  );

  // Situação de um intervalo: livre, já passou, fora do funcionamento ou
  // ocupado (se sobrepõe a um agendamento; cancelados liberam o horário).
  function slotState(professionalId: string, slot: number): SlotState {
    const end = slot + SLOT_MINUTES;
    if (slot < pastMinutes) return "past";
    const overlaps = (gap: TimeRange) =>
      timeToMinutes(gap.start) < end && timeToMinutes(gap.end) > slot;
    // Fora do expediente aceita encaixe; entre janelas, nada.
    if (unavailable.some(overlaps)) return "closed";
    if (breaks.some(overlaps)) return "gap";
    const occupied = appointments.some(
      (appointment) =>
        appointment.professionalId === professionalId &&
        appointment.status !== "CANCELLED" &&
        timeToMinutes(appointment.start) < end &&
        timeToMinutes(appointment.end) > slot,
    );
    return occupied ? "occupied" : "free";
  }

  // Posição vertical de um horário na grade.
  function toPixels(time: string): number {
    return (timeToMinutes(time) - range.start) * PX_PER_MINUTE;
  }

  const nowMinutes = now === null ? null : timeToMinutes(now);
  const showNow =
    nowMinutes !== null && nowMinutes >= range.start && nowMinutes <= range.end;
  const nowTop = showNow ? toPixels(now as string) : 0;

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-card border border-border bg-card">
      <div
        // Celular: horários + uma coluna. A partir do md: uma coluna por
        // profissional, cada uma com largura mínima (a grade rola na horizontal).
        className="grid grid-cols-[4rem_1fr] md:min-w-max md:grid-cols-(--agenda-columns)"
        style={
          {
            "--agenda-columns": `4rem repeat(${Math.max(1, desktopVisibleIds.length)}, minmax(11rem, 1fr))`,
          } as React.CSSProperties
        }
      >
        <div className="sticky top-0 left-0 z-30 border-b border-border bg-card" />
        {professionals.map((professional) => {
          const count = appointments.filter(
            (appointment) =>
              appointment.professionalId === professional.id &&
              appointment.status !== "CANCELLED",
          ).length;

          return (
            <div
              key={professional.id}
              className={`sticky top-0 z-20 border-b border-l border-border bg-card px-3 py-2 ${mobileHidden(professional.id)} ${desktopHidden(professional.id)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {professional.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count} {count === 1 ? "agendamento" : "agendamentos"}
                  </p>
                </div>

                {/* Só no celular, na coluna exibida: troca o profissional. */}
                {onMobileProfessionalChange &&
                  professional.id === mobileProfessionalId &&
                  professionals.length > 1 && (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Hint
                          label="Ver a agenda de outro profissional"
                          side="bottom"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 md:hidden"
                            aria-label="Trocar profissional"
                          >
                            <ChevronsUpDown aria-hidden="true" />
                          </Button>
                        </Hint>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="max-w-[calc(100vw-2rem)] min-w-72"
                      >
                        <DropdownMenuRadioGroup
                          value={mobileProfessionalId}
                          onValueChange={onMobileProfessionalChange}
                        >
                          {professionals.map((option) => (
                            <DropdownMenuRadioItem
                              key={option.id}
                              value={option.id}
                            >
                              {option.name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>
            </div>
          );
        })}

        <div
          className="sticky left-0 z-20 bg-card"
          style={{ height: gridHeight }}
        >
          {slots.map((slot) => (
            <div
              key={slot}
              className="relative"
              style={{ height: SLOT_HEIGHT }}
            >
              <time
                className={`absolute top-1 right-2 text-xs tabular-nums ${
                  slot % 60 === 0 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {minutesToTime(slot)}
              </time>
            </div>
          ))}
        </div>

        {professionals.map((professional) => (
          <div
            key={professional.id}
            className={`relative border-l border-border ${mobileHidden(professional.id)} ${desktopHidden(professional.id)}`}
            style={{ height: gridHeight }}
          >
            {slots.map((slot) => {
              const line = `border-t border-border ${
                slot % 60 === 0 ? "" : "border-dashed"
              }`;
              const time = minutesToTime(slot);

              const state = slotState(professional.id, slot);

              if (!onSlotSelect || state === "occupied") {
                return (
                  <div
                    key={slot}
                    className={line}
                    style={{ height: SLOT_HEIGHT }}
                  />
                );
              }

              // Passou ou entre janelas: o clique explica que não dá para agendar.
              if (state === "past" || state === "gap") {
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() =>
                      state === "past" ? onSlotPast?.() : onSlotGap?.()
                    }
                    aria-label={
                      state === "past"
                        ? `${time} já passou para ${professional.name}`
                        : `${time} sem atendimento para ${professional.name}`
                    }
                    className={`block w-full cursor-not-allowed ${line}`}
                    style={{ height: SLOT_HEIGHT }}
                  />
                );
              }

              // Fora do funcionamento: só encaixe. O botão fica acima do
              // sombreado (z-[1]) para o destaque do mouse aparecer.
              if (state === "closed") {
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onSlotOverbooking?.(professional.id, time)}
                    aria-label={`Encaixar ${professional.name} às ${time}, fora do horário de funcionamento`}
                    className={`relative z-[1] flex w-full cursor-pointer items-center justify-center text-xs text-transparent transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground ${line}`}
                    style={{ height: SLOT_HEIGHT }}
                  >
                    <CalendarClock
                      className="mr-1 size-3.5"
                      aria-hidden="true"
                    />
                    Encaixar às {time}
                  </button>
                );
              }

              // Intervalo livre: clicável, com o "+" aparecendo ao passar o mouse.
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSlotSelect(professional.id, time)}
                  aria-label={`Novo agendamento com ${professional.name} às ${time}`}
                  className={`group/slot flex w-full cursor-pointer items-center justify-center text-xs text-transparent transition-colors hover:bg-brand/10 hover:text-brand focus-visible:bg-brand/10 focus-visible:text-brand ${line}`}
                  style={{ height: SLOT_HEIGHT }}
                >
                  <Plus className="mr-1 size-3.5" aria-hidden="true" />
                  Agendar às {time}
                </button>
              );
            })}

            {unavailable.map((range) => (
              <div
                key={range.start}
                className="pointer-events-none absolute inset-x-0 bg-unavailable"
                style={{
                  top: toPixels(range.start),
                  height: toPixels(range.end) - toPixels(range.start),
                }}
                aria-hidden="true"
              />
            ))}

            {/* Intervalo entre janelas (almoço): área cinza, sem agendamento. */}
            {breaks.map((gap) => (
              <div
                key={gap.start}
                className="pointer-events-none absolute inset-x-0 flex items-center justify-center border-y border-border bg-muted text-xs font-medium text-muted-foreground"
                style={{
                  top: toPixels(gap.start),
                  height: toPixels(gap.end) - toPixels(gap.start),
                }}
              >
                Intervalo
              </div>
            ))}

            {appointments
              .filter(
                (appointment) => appointment.professionalId === professional.id,
              )
              .map((appointment) => (
                <AppointmentBlock
                  key={appointment.id}
                  appointment={appointment}
                  onSelect={onAppointmentSelect}
                  top={toPixels(appointment.start)}
                  height={
                    toPixels(appointment.end) - toPixels(appointment.start)
                  }
                />
              ))}

            {showNow && (
              <div
                className="pointer-events-none absolute inset-x-0 z-10 h-px bg-brand"
                style={{ top: nowTop }}
                aria-hidden="true"
              >
                {/* Uma bolinha só: na primeira coluna; no celular, na visível. */}
                <span
                  className={`absolute -top-1 -left-1 size-2 rounded-full bg-brand ${
                    professional.id === firstVisibleId ? "" : "md:hidden"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
