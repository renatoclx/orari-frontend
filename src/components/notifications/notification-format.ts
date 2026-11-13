import type { NotificationCategory } from "@/types/notification";

// Regras puras das notificações (o sino e as listas).

/** O número do sino: nada em zero, "99+" a partir de 100. */
export function badgeText(count: number): string {
  if (count <= 0) return "";
  return count > 99 ? "99+" : String(count);
}

/** O nome do sino para leitor de tela (o número não fica só na cor). */
export function bellLabel(count: number): string {
  if (count <= 0) return "Notificações";
  return count === 1
    ? "Notificações: 1 não lida"
    : `Notificações: ${count} não lidas`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "agora", "há 5 min", "há 2 h", "ontem", "há 3 dias" ou a data (de uma semana em diante). */
export function relativeTime(iso: string, now = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  if (diff < MINUTE) return "agora";
  if (diff < HOUR) return `há ${Math.floor(diff / MINUTE)} min`;
  if (diff < DAY) return `há ${Math.floor(diff / HOUR)} h`;
  const days = Math.floor(diff / DAY);
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso));
}

/** O nome de cada categoria nas preferências. */
export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  APPOINTMENT: "Agendamentos",
  REMINDER: "Lembretes",
  DAILY_SUMMARY: "Resumo da manhã",
  PENDING_SUMMARY: "Pendências do dia",
  // A boas-vindas não tem interruptor (não aparece nas preferências).
  WELCOME: "Boas-vindas",
};

/** O que cada categoria avisa, em uma linha. */
export const CATEGORY_HINT: Record<NotificationCategory, string> = {
  APPOINTMENT:
    "Quando um horário é marcado, remarcado ou cancelado (pelo cliente ou pela clínica).",
  REMINDER: "30 minutos antes de cada atendimento.",
  DAILY_SUMMARY: "Às 7h30, nos dias em que você tem atendimentos.",
  PENDING_SUMMARY:
    "Contas a pagar e a receber, comandas e aniversariantes do dia, na hora escolhida pela clínica.",
  WELCOME: "Boas-vindas ao Orari.",
};

/** Intervalo da conferência do número do sino (a cada 30 segundos). */
export const POLL_MS = 15_000;
