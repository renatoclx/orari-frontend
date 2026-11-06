import type { AutoMessage, AutoMessageKind } from "@/types/auto-message";

// Regras da tela Mensagens → Automáticas (screens/mensagens.md). As mesmas da
// API (backend: auto-message.catalog.ts): o que a tela barra, a API também barra.

export const MAX_BODY = 500;

const PERSON_VARIABLES = ["nome", "estabelecimento"] as const;
const APPOINTMENT_VARIABLES = [
  ...PERSON_VARIABLES,
  "data",
  "hora",
  "servico",
  "profissional",
] as const;
export type MessageVariable = (typeof APPOINTMENT_VARIABLES)[number];

type KindInfo = {
  title: string;
  /** Quando a mensagem sai, abaixo do título. */
  when: string;
  variables: readonly MessageVariable[];
};

/** As seis situações, na ordem da tela. */
export const AUTO_MESSAGE_INFO: Record<AutoMessageKind, KindInfo> = {
  REMINDER: {
    title: "Lembrete",
    when: "Antes de cada horário marcado, nos tempos escolhidos.",
    variables: APPOINTMENT_VARIABLES,
  },
  APPOINTMENT_CREATED: {
    title: "Agendamento marcado",
    when: "Quando a clínica marca um horário avulso para o cliente.",
    variables: APPOINTMENT_VARIABLES,
  },
  APPOINTMENT_RESCHEDULED: {
    title: "Agendamento alterado",
    when: "Quando a clínica muda a data ou o horário (alterar, remanejar ou repor).",
    variables: APPOINTMENT_VARIABLES,
  },
  APPOINTMENT_CANCELLED: {
    title: "Agendamento cancelado",
    when: "Quando a clínica cancela um horário (avulso, uma sessão ou uma sessão de turma).",
    variables: APPOINTMENT_VARIABLES,
  },
  BIRTHDAY: {
    title: "Aniversário",
    when: "No dia do aniversário, às 9h (data de nascimento do cadastro).",
    variables: PERSON_VARIABLES,
  },
  MISS_YOU: {
    title: "Sentimos sua falta",
    when: "Às 10h, para quem não volta desde o último atendimento e não tem nada marcado.",
    variables: PERSON_VARIABLES,
  },
};

export const REMINDER_OFFSET_OPTIONS = [
  { minutes: 30, label: "30 min" },
  { minutes: 60, label: "1h" },
  { minutes: 120, label: "2h" },
  { minutes: 1440, label: "24h" },
  { minutes: 2880, label: "48h" },
] as const;

export const MISS_YOU_OPTIONS = [15, 30, 45, 60, 90] as const;

// Dados fictícios do exemplo ao vivo (o estabelecimento é o da clínica).
const SAMPLE = {
  nome: "Ana",
  data: "12/11",
  hora: "09:00",
  servico: "Pilates",
  profissional: "Camila",
} as const;

const VARIABLE = /\{([^{}\s]+)\}/g;

/** Variáveis do texto que não estão entre as permitidas. */
export function variablesOutside(
  text: string,
  allowed: readonly string[],
): string[] {
  const found = [...text.matchAll(VARIABLE)].map((match) => match[1]);
  return [...new Set(found.filter((name) => !allowed.includes(name)))];
}

/** Variáveis do texto que não existem na situação. */
export function unknownVariables(
  body: string,
  kind: AutoMessageKind,
): string[] {
  return variablesOutside(body, AUTO_MESSAGE_INFO[kind].variables);
}

export type AutoMessageErrors = { body?: string; offsets?: string };

export function autoMessageErrors(message: AutoMessage): AutoMessageErrors {
  const errors: AutoMessageErrors = {};
  const body = message.body.trim();
  const unknown = unknownVariables(body, message.kind);
  if (!body) errors.body = "Escreva a mensagem.";
  else if (body.length > MAX_BODY)
    errors.body = `Use até ${MAX_BODY} caracteres.`;
  else if (unknown.length > 0) {
    errors.body = `${unknown.map((name) => `{${name}}`).join(", ")} não existe nesta mensagem.`;
  }
  if (
    message.kind === "REMINDER" &&
    message.enabled &&
    message.reminderOffsets.length === 0
  ) {
    errors.offsets = "Escolha ao menos um tempo antes do horário.";
  }
  return errors;
}

export function autoMessagesHaveErrors(messages: AutoMessage[]): boolean {
  return messages.some((message) => {
    const errors = autoMessageErrors(message);
    return Boolean(errors.body || errors.offsets);
  });
}

/** O texto como o cliente o recebe, com dados fictícios. */
export function previewMessage(body: string, placeName: string): string {
  const values: Record<string, string> = {
    ...SAMPLE,
    estabelecimento: placeName,
  };
  return body.replace(VARIABLE, (whole, name: string) => values[name] ?? whole);
}

/**
 * Insere a variável no lugar do cursor (ou no lugar do trecho selecionado) e
 * devolve onde o cursor fica depois dela.
 */
export function insertVariable(
  body: string,
  variable: MessageVariable,
  selection: { start: number; end: number },
): { body: string; caret: number } {
  const token = `{${variable}}`;
  return {
    body: body.slice(0, selection.start) + token + body.slice(selection.end),
    caret: selection.start + token.length,
  };
}

/** Liga ou desliga um tempo do lembrete, do maior para o menor (como a API grava). */
export function toggleOffset(offsets: number[], minutes: number): number[] {
  const next = offsets.includes(minutes)
    ? offsets.filter((value) => value !== minutes)
    : [...offsets, minutes];
  return next.sort((a, b) => b - a);
}

export function sameAutoMessages(a: AutoMessage[], b: AutoMessage[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
