import {
  PERIODS,
  periodOf,
  type Period,
} from "@/components/agenda/agenda-availability";
import { minutesToTime, timeToMinutes } from "@/utils/time";

// Horários livres do app agrupados por período (screens/app-cliente.md), com a
// mesma divisão da agenda da clínica: manhã até 11:59, tarde até 17:59, noite.

/** Um horário livre como a API devolve: hora no relógio da clínica e o instante. */
export type Slot = { time: string; startAt: string };

export type SlotGroup = { period: Period; label: string; slots: Slot[] };

/** Só os períodos com horário, na ordem do dia. */
export function groupSlotsByPeriod(slots: Slot[]): SlotGroup[] {
  return PERIODS.map(({ id, label }) => ({
    period: id,
    label,
    slots: slots.filter((slot) => periodOf(timeToMinutes(slot.time)) === id),
  })).filter((group) => group.slots.length > 0);
}

/** "1 horário" ou "13 horários". */
export function slotsLabel(count: number): string {
  return count === 1 ? "1 horário" : `${count} horários`;
}

/** "09:00 às 09:45": o horário com o fim, pela duração do serviço (minutos). */
export function slotRange(time: string, duration: number): string {
  // Passando da meia-noite, o fim volta a contar do zero ("23:30 às 00:30").
  const end = (timeToMinutes(time) + duration) % (24 * 60);
  return `${time} às ${minutesToTime(end)}`;
}
