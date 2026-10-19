import { weekDayName } from "@/components/recurrences/recurrence-schedule";

// Dia da semana de uma data escolhida (ex.: "terça-feira"): a primeira sessão
// é a do primeiro dia marcado a partir dela, não necessariamente nesta data.
export function WeekDayHint({ date }: { date: string }) {
  return <p className="text-xs text-muted-foreground">{weekDayName(date)}</p>;
}
