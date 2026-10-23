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

// Rótulos em pt-BR dos tipos de usuário do backend.
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

/**
 * "12345678000190" → "12.345.678/0001-90". O CNPJ alfanumérico tem letras nas
 * 12 primeiras posições e dois dígitos no fim ("12ABC34501DE35" →
 * "12.ABC.345/01DE-35").
 */
export function formatCnpj(cnpj: string): string {
  return cnpj.replace(
    /^([0-9A-Z]{2})([0-9A-Z]{3})([0-9A-Z]{3})([0-9A-Z]{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

// O documento da empresa é um CPF (11 dígitos) ou um CNPJ (14 caracteres).
const CPF_LENGTH = 11;

/** "CPF" ou "CNPJ", pelo tamanho do documento da empresa. */
export function documentLabel(document: string): "CPF" | "CNPJ" {
  return document.length === CPF_LENGTH ? "CPF" : "CNPJ";
}

/** Documento da empresa com máscara: CPF (11) ou CNPJ (14); outro tamanho fica como veio. */
export function formatDocument(document: string): string {
  return document.length === CPF_LENGTH
    ? formatCpf(document)
    : formatCnpj(document);
}
