import {
  MAX_BODY,
  variablesOutside,
  type MessageVariable,
} from "@/components/auto-messages/auto-messages";

// Regras de Mensagens → Enviar (screens/mensagens.md); as mesmas da API.

export const MAX_TITLE = 100;

/** Sem agendamento: só o cliente e o estabelecimento. */
export const CAMPAIGN_VARIABLES = [
  "nome",
  "estabelecimento",
] as const satisfies readonly MessageVariable[];

export type CampaignFields = { title: string; body: string };
export type CampaignErrors = Partial<Record<keyof CampaignFields, string>>;

function fieldError(value: string, max: number, empty: string) {
  const text = value.trim();
  if (!text) return empty;
  if (text.length > max) return `Use até ${max} caracteres.`;
  const unknown = variablesOutside(text, CAMPAIGN_VARIABLES);
  if (unknown.length > 0) {
    return `${unknown.map((name) => `{${name}}`).join(", ")} não existe nesta mensagem.`;
  }
  return undefined;
}

export function campaignErrors(fields: CampaignFields): CampaignErrors {
  const errors: CampaignErrors = {};
  const title = fieldError(fields.title, MAX_TITLE, "Escreva o título.");
  const body = fieldError(fields.body, MAX_BODY, "Escreva a mensagem.");
  if (title) errors.title = title;
  if (body) errors.body = body;
  return errors;
}

/** "1 cliente" / "12 clientes". */
export function clientsLabel(count: number): string {
  return count === 1 ? "1 cliente" : `${count} clientes`;
}
