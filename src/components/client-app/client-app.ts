import { onlyDigits } from "@/utils/masks";

// Regras e textos puros do app do cliente (screens/app-cliente.md).

/** Fuso usado quando ainda não há estabelecimento para tirar o fuso dele. */
export const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

/** "Beatriz Nogueira" → "Beatriz". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** Telefone com DDD, como a API aceita (10 ou 11 dígitos); fora disso, a mensagem. */
export function phoneError(value: string): string | undefined {
  const digits = onlyDigits(value);
  if (!digits) return "Informe o telefone com DDD.";
  return digits.length === 10 || digits.length === 11
    ? undefined
    : "Informe o telefone com DDD (10 ou 11 dígitos).";
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Com "@" o login é um e-mail (só o profissional tem); sem, um telefone. */
export function isEmailLogin(value: string): boolean {
  return value.includes("@");
}

/** Telefone com DDD ou e-mail, como o formulário de entrar aceita. */
export function loginError(value: string): string | undefined {
  if (!value.trim()) return "Informe o telefone ou o e-mail.";
  if (isEmailLogin(value)) {
    return EMAIL_PATTERN.test(value.trim())
      ? undefined
      : "Informe um e-mail válido.";
  }
  return phoneError(value);
}

/** Senha nova e a confirmação, com a mesma regra dos usuários (8 a 72). */
export function newPasswordErrors(
  password: string,
  confirmation: string,
): { password?: string; confirmation?: string } {
  if (password.length < 8)
    return { password: "A senha precisa ter pelo menos 8 caracteres." };
  if (password.length > 72)
    return { password: "A senha pode ter no máximo 72 caracteres." };
  if (password !== confirmation)
    return { confirmation: "As senhas não são iguais." };
  return {};
}

function parts(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
) {
  const found = new Intl.DateTimeFormat("pt-BR", { ...options, timeZone })
    .formatToParts(date)
    .reduce<Record<string, string>>((all, part) => {
      all[part.type] = part.value;
      return all;
    }, {});
  return found;
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Data da saudação do Início: "Quinta, 5 nov 2026". */
export function greetingDate(date: Date, timeZone: string): string {
  const p = parts(date, timeZone, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const weekday = capitalize(p.weekday.split("-")[0]);
  return `${weekday}, ${p.day} ${p.month.replace(".", "")} ${p.year}`;
}

/** Quando é um agendamento, no relógio da clínica: "Qui, 12/11 às 08:00". */
export function appointmentWhen(iso: string, timeZone: string): string {
  const p = parts(new Date(iso), timeZone, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const weekday = capitalize(p.weekday.replace(".", ""));
  return `${weekday}, ${p.day}/${p.month} às ${p.hour}:${p.minute}`;
}

/** Iniciais para o lugar da logo: "Studio Aurora" → "SA". */
export function placeInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  return (words[0][0] + (words[1]?.[0] ?? "")).toUpperCase();
}

/**
 * O que a tela do link de acesso pede: com a conta entrada, só ligar o
 * estabelecimento; sem ela, criar a conta ou uma senha nova para a que existe.
 */
export type AccessLinkMode = "attach" | "create" | "reset";

export function accessLinkMode(
  loggedIn: boolean,
  hasAccount: boolean,
): AccessLinkMode {
  if (loggedIn) return "attach";
  return hasAccount ? "reset" : "create";
}

/**
 * Dias que o cliente pode escolher para agendar: de hoje até `maxDaysAhead`
 * dias à frente (regra da clínica), no máximo `limit` (a lista é para o celular).
 */
export function bookingDays(
  today: string,
  maxDaysAhead: number,
  limit = 60,
): string[] {
  const count = Math.min(maxDaysAhead, limit) + 1;
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

/** Partes do botão de um dia: "qui", "12" e "nov". */
export function dayChip(date: string): {
  weekday: string;
  day: string;
  month: string;
} {
  const p = parts(new Date(`${date}T12:00:00Z`), "UTC", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return {
    weekday: p.weekday.replace(".", ""),
    day: p.day,
    month: p.month.replace(".", ""),
  };
}

/** Data por extenso para o resumo: "quinta, 12 de novembro". */
export function longDate(date: string): string {
  const p = parts(new Date(`${date}T12:00:00Z`), "UTC", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return `${p.weekday.split("-")[0]}, ${p.day} de ${p.month}`;
}
