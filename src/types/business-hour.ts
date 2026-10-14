// Espelha a resposta de /business-hours do backend.

/** Mesmos valores do enum WeekDay do backend. */
export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/** Janela de atendimento da empresa em um dia da semana (horários "HH:MM"). */
export type BusinessHour = {
  id: string;
  weekDay: WeekDay;
  openAt: string;
  closeAt: string;
};
