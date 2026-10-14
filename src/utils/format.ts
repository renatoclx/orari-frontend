import type { UserType } from "@/types/auth";
import type { AddressType, ContactType } from "@/types/people";

/** "12345678909" → "123.456.789-09" */
export function formatCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

/** "11987654321" → "(11) 98765-4321"; "1133224455" → "(11) 3322-4455" */
export function formatPhone(phone: string): string {
  return phone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
}

/**
 * "1990-03-15T00:00:00.000Z" → "15/03/1990"
 *
 * Para datas sem horário (ex.: nascimento): formatar em UTC evita que o fuso
 * de São Paulo jogue a data para o dia anterior.
 */
export function formatDateOnly(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(isoDate),
  );
}

/** "Lucas Andrade" → "LA"; "Hugo" → "H" */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const userTypeLabels: Record<UserType, string> = {
  SUPER_ADMIN: "Super administrador",
  ADMIN: "Administrador",
  USER: "Usuário",
};

/** "ADMIN" → "Administrador" */
export function formatUserType(type: UserType): string {
  return userTypeLabels[type];
}

/** Rótulos dos tipos de contato, na ordem em que aparecem nos selects. */
export const contactTypeLabels: Record<ContactType, string> = {
  MAIN: "Pessoal",
  MESSAGE: "Recados",
  BRANCH: "Filial",
};

/** Rótulos dos tipos de endereço (mesmos valores dos contatos). */
export const addressTypeLabels: Record<AddressType, string> = {
  MAIN: "Pessoal",
  MESSAGE: "Recados",
  BRANCH: "Filial",
};

/** "50.00" → "R$ 50,00" */
export function formatPrice(price: string | number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(price));
}

/** 60 → "60 minutos"; 1 → "1 minuto" */
export function formatDuration(minutes: number): string {
  return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
}
