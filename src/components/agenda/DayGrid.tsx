import { AppointmentBlock } from "@/components/agenda/AppointmentBlock";
import type {
  AgendaAppointment,
  Professional,
  TimeRange,
} from "@/types/agenda";
import { minutesToTime, timeToMinutes } from "@/utils/time";

const GRID_START = timeToMinutes("07:00");
const GRID_END = timeToMinutes("20:00");
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 48;
const PX_PER_MINUTE = SLOT_HEIGHT / SLOT_MINUTES;
const GRID_HEIGHT = (GRID_END - GRID_START) * PX_PER_MINUTE;

const slots = Array.from(
  { length: (GRID_END - GRID_START) / SLOT_MINUTES },
  (_, index) => GRID_START + index * SLOT_MINUTES,
);

function toPixels(time: string): number {
  return (timeToMinutes(time) - GRID_START) * PX_PER_MINUTE;
}

// Tudo que fica fora do expediente ou cai em um intervalo.
function unavailableRanges(professional: Professional): TimeRange[] {
  return [
    { start: minutesToTime(GRID_START), end: professional.workingHours.start },
    ...professional.breaks,
    { start: professional.workingHours.end, end: minutesToTime(GRID_END) },
  ];
}

type DayGridProps = {
  professionals: Professional[];
  appointments: AgendaAppointment[];
  now: string;
};

export function DayGrid({ professionals, appointments, now }: DayGridProps) {
  const nowTop = toPixels(now);

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-card border border-border bg-card">
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `4rem repeat(${professionals.length}, minmax(11rem, 1fr))`,
        }}
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
              className="sticky top-0 z-20 border-b border-l border-border bg-card px-3 py-2"
            >
              <p className="text-sm font-semibold">{professional.name}</p>
              <p className="text-xs text-muted-foreground">
                {count} {count === 1 ? "agendamento" : "agendamentos"}
              </p>
            </div>
          );
        })}

        <div
          className="sticky left-0 z-20 bg-card"
          style={{ height: GRID_HEIGHT }}
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

        {professionals.map((professional, index) => (
          <div
            key={professional.id}
            className="relative border-l border-border"
            style={{ height: GRID_HEIGHT }}
          >
            {slots.map((slot) => (
              <div
                key={slot}
                className={`border-t border-border ${
                  slot % 60 === 0 ? "" : "border-dashed"
                }`}
                style={{ height: SLOT_HEIGHT }}
              />
            ))}

            {unavailableRanges(professional).map((range) => (
              <div
                key={range.start}
                className="absolute inset-x-0 bg-unavailable"
                style={{
                  top: toPixels(range.start),
                  height: toPixels(range.end) - toPixels(range.start),
                }}
                aria-hidden="true"
              />
            ))}

            {appointments
              .filter(
                (appointment) => appointment.professionalId === professional.id,
              )
              .map((appointment) => (
                <AppointmentBlock
                  key={appointment.id}
                  appointment={appointment}
                  top={toPixels(appointment.start)}
                  height={
                    toPixels(appointment.end) - toPixels(appointment.start)
                  }
                />
              ))}

            <div
              className="pointer-events-none absolute inset-x-0 z-10 h-px bg-brand"
              style={{ top: nowTop }}
              aria-hidden="true"
            >
              {index === 0 && (
                <span className="absolute -top-1 -left-1 size-2 rounded-full bg-brand" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
