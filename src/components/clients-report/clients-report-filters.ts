// Filtros do Perfil do cliente (na URL), comuns ao servidor e ao navegador.
import { isDateString } from "@/utils/time";

export const CLIENTS_REPORT_PATH = "/relatorios/perfil-do-cliente";

export type ClientsReportFilters = {
  /** "aaaa-mm-dd"; vazias = mês atual. */
  from: string;
  to: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/** Período a partir da URL (?de=, ?ate=); só vale com as duas datas em ordem. */
export function readClientsReportFilters(
  searchParams: SearchParams,
): ClientsReportFilters {
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  return { from: validPeriod ? from : "", to: validPeriod ? to : "" };
}

/** Parâmetros da URL; o mês atual fica de fora. */
export function clientsReportQuery(
  filters: ClientsReportFilters,
  month: { from: string; to: string },
  overrides: Partial<ClientsReportFilters> = {},
): URLSearchParams {
  const next = { ...filters, ...overrides };
  const query = new URLSearchParams();
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

/** Rótulo de cada tipo de atendimento, na ordem da tela. */
export const KIND_LABELS = {
  single: "Avulso",
  recurrence: "Recorrência",
  package: "Pacote",
  class: "Turma",
} as const;

/** Rótulo da faixa de idade; null é sem data de nascimento. */
export function ageLabel(key: string | null): string {
  if (key === null) return "Não informado";
  if (key === "0-17") return "Até 17 anos";
  if (key === "60+") return "60 anos ou mais";
  const [min, max] = key.split("-");
  return `${min} a ${max} anos`;
}

/** Rótulo da cidade; null é sem endereço. */
export const cityLabel = (name: string | null) => name ?? "Não informado";
