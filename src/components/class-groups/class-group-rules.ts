import { WEEK_DAYS } from "@/components/recurrences/recurrence-schedule";
import type { WeekDay } from "@/types/business-hour";
import type { ClassGroupDay } from "@/types/class-group";
import { minutesToTime, timeToMinutes } from "@/utils/time";

// Limites da turma, os mesmos da API (docs/turmas.md).
export const CLASS_NAME_MAX = 100;
export const CAPACITY_MIN = 2;
export const CAPACITY_MAX = 100;
export const CLASS_DAYS_MAX = 21;

/** Um horário no formulário; `key` identifica a linha (ainda sem id da API). */
export type ClassSlotDraft = {
  key: string;
  weekDay: WeekDay;
  startTime: string;
};

export type ClassGroupFormValues = {
  name: string;
  serviceId: string;
  professionalId: string;
  /** Só dígitos. */
  capacity: string;
  slots: ClassSlotDraft[];
  /** Duração do serviço, em minutos (0 = serviço não escolhido). */
  duration: number;
};

export type ClassGroupFormErrors = Partial<
  Record<"name" | "service" | "professional" | "capacity" | "days", string>
> & {
  /** Erro de cada horário, pela chave. */
  slots?: Record<string, string>;
};

/** Fim do horário: início mais a duração do serviço (no máximo 24:00). */
export function endTimeOf(startTime: string, duration: number): string {
  return minutesToTime(Math.min(24 * 60, timeToMinutes(startTime) + duration));
}

/** Vagas, entre o mínimo e o máximo. */
export function capacityError(capacity: string): string | undefined {
  const value = Number(capacity);
  if (!capacity) return "Informe a quantidade de vagas.";
  if (!Number.isInteger(value) || value < CAPACITY_MIN || value > CAPACITY_MAX)
    return `As vagas vão de ${CAPACITY_MIN} a ${CAPACITY_MAX}.`;
  return undefined;
}

/** Nome opcional, até o tamanho da API. */
export function nameError(name: string): string | undefined {
  return name.trim().length > CLASS_NAME_MAX
    ? `Use até ${CLASS_NAME_MAX} caracteres.`
    : undefined;
}

/**
 * Horário sem início, ou que se sobrepõe a outro do mesmo dia (com a duração
 * do serviço). O funcionamento e as outras turmas do profissional são
 * conferidos pela API.
 */
export function slotErrors(
  slots: ClassSlotDraft[],
  duration: number,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const slot of slots) {
    if (!slot.startTime) {
      errors[slot.key] = "Informe o horário de início.";
      continue;
    }
    if (duration <= 0) continue;
    const start = timeToMinutes(slot.startTime);
    const overlaps = slots.some(
      (other) =>
        other.key !== slot.key &&
        other.weekDay === slot.weekDay &&
        other.startTime &&
        start < timeToMinutes(other.startTime) + duration &&
        timeToMinutes(other.startTime) < start + duration,
    );
    if (overlaps)
      errors[slot.key] = "Este horário se sobrepõe a outro do mesmo dia.";
  }
  return errors;
}

/** Validação do cadastro, a mesma no navegador e na Server Action. */
export function validateClassGroupForm(
  values: ClassGroupFormValues,
): ClassGroupFormErrors {
  const slots = slotErrors(values.slots, values.duration);
  return {
    name: nameError(values.name),
    service: values.serviceId ? undefined : "Selecione o serviço.",
    professional: values.professionalId
      ? undefined
      : "Selecione o profissional.",
    capacity: capacityError(values.capacity),
    days:
      values.slots.length === 0
        ? "Adicione ao menos um horário."
        : values.slots.length > CLASS_DAYS_MAX
          ? `Use até ${CLASS_DAYS_MAX} horários.`
          : undefined,
    slots: Object.keys(slots).length > 0 ? slots : undefined,
  };
}

/** Há algum erro no resultado da validação? */
export function hasErrors(errors: ClassGroupFormErrors): boolean {
  return Object.values(errors).some((value) => value !== undefined);
}

const SHORT = Object.fromEntries(WEEK_DAYS.map((d) => [d.id, d.short]));
const LONG = Object.fromEntries(WEEK_DAYS.map((d) => [d.id, d.long]));
const ORDER = WEEK_DAYS.map((d) => d.id);

/** Horários em ordem: dia da semana (segunda a domingo) e início. */
export function sortClassDays<
  T extends Pick<ClassGroupDay, "weekDay" | "startTime">,
>(days: T[]): T[] {
  return [...days].sort(
    (a, b) =>
      ORDER.indexOf(a.weekDay) - ORDER.indexOf(b.weekDay) ||
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );
}

/** "Seg 08:00 · Seg 18:00 · Qui 09:00": dia da semana e início, em ordem. */
export function describeClassDays(
  days: Pick<ClassGroupDay, "weekDay" | "startTime">[],
): string {
  return sortClassDays(days)
    .map((day) => `${SHORT[day.weekDay]} ${day.startTime}`)
    .join(" · ");
}

/** Nome longo do dia ("Segunda-feira"). */
export function weekDayLong(weekDay: ClassGroupDay["weekDay"]): string {
  return LONG[weekDay];
}

/** Nome da turma, ou o serviço quando não há nome. */
export function classGroupLabel(group: {
  name: string | null;
  service: { name: string };
}): string {
  return group.name ?? group.service.name;
}
