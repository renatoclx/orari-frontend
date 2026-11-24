// Filtros do relatório de agendamentos (na URL), comuns ao servidor e ao navegador.
import { isDateString } from "@/utils/time";

export const APPOINTMENT_REPORT_PATH = "/relatorios/agendamentos";

/** Valor do "Todos os profissionais" no Select (o Radix não aceita vazio). */
export const ALL_PROFESSIONALS = "todos";

export type AppointmentReportFilters = {
  /** Id do profissional ou ALL_PROFESSIONALS. */
  professional: string;
  /** "aaaa-mm-dd"; vazias = mês atual. */
  from: string;
  to: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/**
 * Filtros a partir da URL (?profissional=, ?de=, ?ate=), da tela e da versão
 * impressa. Profissional desconhecido vira "todos"; o período só vale com as
 * duas datas em ordem.
 */
export function readAppointmentReportFilters(
  searchParams: SearchParams,
  professionalIds: string[],
): AppointmentReportFilters {
  const chosen = text(searchParams.profissional);
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  return {
    professional: professionalIds.includes(chosen) ? chosen : ALL_PROFESSIONALS,
    from: validPeriod ? from : "",
    to: validPeriod ? to : "",
  };
}

/** Parâmetros da URL; o padrão (todos, mês atual) fica de fora. */
export function appointmentReportQuery(
  filters: AppointmentReportFilters,
  month: { from: string; to: string },
  overrides: Partial<AppointmentReportFilters> = {},
): URLSearchParams {
  const next = { ...filters, ...overrides };
  const query = new URLSearchParams();
  if (next.professional !== ALL_PROFESSIONALS) {
    query.set("profissional", next.professional);
  }
  if (next.from || next.to) {
    const from = next.from || month.from;
    const to = next.to || month.to;
    if (from !== month.from || to !== month.to) {
      query.set("de", from);
      query.set("ate", to);
    }
  }
  return query;
}

/** Dias da semana a partir da segunda (weekDay da API: 0 = domingo). */
export const WEEK_DAYS = [
  { weekDay: 1, short: "Seg", long: "Segunda" },
  { weekDay: 2, short: "Ter", long: "Terça" },
  { weekDay: 3, short: "Qua", long: "Quarta" },
  { weekDay: 4, short: "Qui", long: "Quinta" },
  { weekDay: 5, short: "Sex", long: "Sexta" },
  { weekDay: 6, short: "Sáb", long: "Sábado" },
  { weekDay: 0, short: "Dom", long: "Domingo" },
] as const;
