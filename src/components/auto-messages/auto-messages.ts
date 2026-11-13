import type {
  AutoMessage,
  AutoMessageKind,
  SummaryItem,
} from "@/types/auto-message";

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
// O resumo da manhã do profissional: o dia, o primeiro horário e quantos atendimentos.
const SUMMARY_VARIABLES = [
  ...PERSON_VARIABLES,
  "data",
  "hora",
  "quantidade",
] as const;
// O resumo de pendências do administrador: {resumo} é a frase pronta.
const ADMIN_VARIABLES = [...PERSON_VARIABLES, "data", "resumo"] as const;
export type MessageVariable =
  | (typeof APPOINTMENT_VARIABLES)[number]
  | (typeof SUMMARY_VARIABLES)[number]
  | (typeof ADMIN_VARIABLES)[number];

type KindInfo = {
  title: string;
  /** Quando a mensagem sai, abaixo do título. */
  when: string;
  variables: readonly MessageVariable[];
};

/** As nove situações (cada uma aparece na página do grupo dela). */
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
  PROFESSIONAL_REMINDER: {
    title: "Lembrete do profissional",
    when: "30 minutos antes de cada atendimento do profissional (uma vez por sessão, nas turmas).",
    variables: APPOINTMENT_VARIABLES,
  },
  PROFESSIONAL_SUMMARY: {
    title: "Resumo da manhã do profissional",
    when: "Às 7h30, nos dias em que o profissional tem atendimentos.",
    variables: SUMMARY_VARIABLES,
  },
  ADMIN_SUMMARY: {
    title: "Resumo de pendências do dia",
    when: "Uma vez por dia, na hora escolhida, só com os itens marcados e que o plano libera. Dia sem nada com número não manda nada.",
    variables: ADMIN_VARIABLES,
  },
};

/** As páginas de Mensagens → Automáticas: uma por quem recebe, na ordem do menu. */
export type AutoMessageGroup = "clientes" | "profissionais" | "administradores";

export const AUTO_MESSAGE_GROUPS: Record<
  AutoMessageGroup,
  { title: string; kinds: readonly AutoMessageKind[] }
> = {
  clientes: {
    title: "Mensagens ao cliente",
    kinds: [
      "REMINDER",
      "APPOINTMENT_CREATED",
      "APPOINTMENT_RESCHEDULED",
      "APPOINTMENT_CANCELLED",
      "BIRTHDAY",
      "MISS_YOU",
    ],
  },
  profissionais: {
    title: "Mensagens ao profissional",
    kinds: ["PROFESSIONAL_REMINDER", "PROFESSIONAL_SUMMARY"],
  },
  administradores: {
    title: "Mensagens ao administrador",
    kinds: ["ADMIN_SUMMARY"],
  },
};

/** As horas possíveis do resumo do administrador. */
export const SUMMARY_HOUR_OPTIONS = [7, 8, 9, 10] as const;

/** Os itens do resumo e o nome de cada um na tela. */
export const SUMMARY_ITEM_OPTIONS: { item: SummaryItem; label: string }[] = [
  { item: "PAYABLE_TODAY", label: "Contas a pagar hoje" },
  { item: "PAYABLE_OVERDUE", label: "Contas atrasadas" },
  { item: "RECEIVABLE_OVERDUE", label: "Recebimentos atrasados" },
  { item: "OPEN_TABS", label: "Comandas do dia" },
  { item: "BIRTHDAYS", label: "Aniversariantes" },
];

/** Liga ou desliga um item do resumo, mantendo a ordem do catálogo. */
export function toggleSummaryItem(
  items: SummaryItem[],
  item: SummaryItem,
): SummaryItem[] {
  const next = items.includes(item)
    ? items.filter((value) => value !== item)
    : [...items, item];
  return SUMMARY_ITEM_OPTIONS.map((option) => option.item).filter((value) =>
    next.includes(value),
  );
}

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
  quantidade: "5 atendimentos",
  resumo: "3 contas a pagar hoje, 2 recebimentos atrasados e 4 aniversariantes",
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

export type AutoMessageErrors = {
  body?: string;
  offsets?: string;
  items?: string;
};

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
  if (
    message.kind === "ADMIN_SUMMARY" &&
    message.enabled &&
    message.summaryItems.length === 0
  ) {
    errors.items = "Escolha ao menos um item.";
  }
  return errors;
}

export function autoMessagesHaveErrors(messages: AutoMessage[]): boolean {
  return messages.some((message) => {
    const errors = autoMessageErrors(message);
    return Boolean(errors.body || errors.offsets || errors.items);
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
