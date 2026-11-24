import { onlyDigits } from "@/utils/masks";

// Regras puras de "Meus clientes" do app do profissional
// (screens/app-profissional.md).

/** A página da URL (`?pagina=`): inteiro a partir de 1; o resto vale 1. */
export function parsePageParam(value: unknown): number {
  const page = typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** Quantas páginas há para `total` itens (sempre ao menos 1). */
export function pageCount(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit));
}

// O contato do cadastro é um celular ou fixo brasileiro (DDD + número).
const hasBrazilianLength = (digits: string) =>
  digits.length === 10 || digits.length === 11;

/** Link para ligar (`tel:`); nada se o telefone não tem DDD + número. */
export function telUrl(phone: string | null): string | null {
  const digits = onlyDigits(phone ?? "");
  return hasBrazilianLength(digits) ? `tel:+55${digits}` : null;
}

/** Link do WhatsApp (`wa.me`); nada se o telefone não tem DDD + número. */
export function whatsappUrl(phone: string | null): string | null {
  const digits = onlyDigits(phone ?? "");
  return hasBrazilianLength(digits) ? `https://wa.me/55${digits}` : null;
}

/** "05/11/2026", no relógio da clínica. */
export function dateOf(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}
