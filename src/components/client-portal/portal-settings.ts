import type { PortalSettings } from "@/types/portal";

// Opções e regras da tela Portal do cliente (screens/portal-do-cliente.md).
// Os limites são os mesmos da API.

/** Antecedência mínima para agendar, em minutos. */
export const ADVANCE_OPTIONS = [0, 30, 60, 120, 180, 360, 720, 1440, 2880];
/** Até quantas horas antes o cliente cancela. */
export const CANCEL_OPTIONS = [0, 2, 6, 12, 24, 48, 72];
export const MIN_DAYS_AHEAD = 1;
export const MAX_DAYS_AHEAD = 365;

/** "Sem antecedência", "30 min", "1 h", "1 h 30 min", "2 dias". */
export function formatMinutes(minutes: number): string {
  if (minutes === 0) return "Sem antecedência";
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return days === 1 ? "1 dia" : `${days} dias`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** "Até o início", "2 horas antes", "1 dia antes". */
export function formatCancelHours(hours: number): string {
  if (hours === 0) return "Até o início";
  if (hours % 24 === 0) {
    const days = hours / 24;
    return days === 1 ? "1 dia antes" : `${days} dias antes`;
  }
  return hours === 1 ? "1 hora antes" : `${hours} horas antes`;
}

/**
 * As opções de um select, com o valor gravado incluído se não for uma delas
 * (a API aceita qualquer valor no limite; a tela não pode perdê-lo).
 */
export function optionsWith(options: number[], current: number): number[] {
  return options.includes(current)
    ? options
    : [...options, current].sort((a, b) => a - b);
}

/** Dias à frente digitados: inteiro de 1 a 365; fora disso, a mensagem. */
export function daysAheadError(value: string): string | undefined {
  const days = Number(value);
  return /^\d+$/.test(value.trim()) &&
    days >= MIN_DAYS_AHEAD &&
    days <= MAX_DAYS_AHEAD
    ? undefined
    : `Informe de ${MIN_DAYS_AHEAD} a ${MAX_DAYS_AHEAD} dias.`;
}

/** Endereço da clínica no app do cliente, para divulgar (`https://app…/app/local/<subdomínio>`). */
export function portalUrl(origin: string, subdomain: string): string {
  return `${origin.replace(/\/$/, "")}/app/local/${subdomain}`;
}

/** Aparecer na busca exige o segmento (a API recusa sem ele). */
export function segmentError(
  settings: Pick<PortalSettings, "listed" | "segment">,
): string | undefined {
  return settings.listed && !settings.segment
    ? "Escolha o segmento para aparecer na busca."
    : undefined;
}

/** Comparação para saber se a seção mudou. */
export const samePortalSettings = (a: PortalSettings, b: PortalSettings) =>
  a.enabled === b.enabled &&
  a.minAdvanceMinutes === b.minAdvanceMinutes &&
  a.maxDaysAhead === b.maxDaysAhead &&
  a.cancelUntilHours === b.cancelUntilHours &&
  a.listed === b.listed &&
  a.segment === b.segment;
