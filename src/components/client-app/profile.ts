import { phoneError } from "@/components/client-app/client-app";
import { isValidCpf } from "@/utils/document";
import { onlyDigits } from "@/utils/masks";

// Regras de Meus dados no app (screens/app-cliente.md), as mesmas da API.

export type ProfileFields = {
  name: string;
  phone: string;
  email: string;
  document: string;
  birthDate: string;
  profession: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  /** Cidade e UF vindas do CEP (o cliente não digita). */
  cityName: string;
  cityState: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Erros por campo. O endereço é opcional, mas, começado (CEP), pede rua,
 * número e a cidade achada pelo CEP. `today` em aaaa-mm-dd (nascimento não
 * pode ser futuro).
 */
export function profileErrors(
  fields: ProfileFields,
  today: string,
): Partial<Record<keyof ProfileFields, string>> {
  const errors: Partial<Record<keyof ProfileFields, string>> = {};
  if (fields.name.trim().length < 2) errors.name = "Informe seu nome.";
  const phone = phoneError(fields.phone);
  if (phone) errors.phone = phone;
  if (fields.email.trim() && !EMAIL.test(fields.email.trim()))
    errors.email = "Informe um e-mail válido.";
  if (fields.document && !isValidCpf(onlyDigits(fields.document)))
    errors.document = "Informe um CPF válido.";
  if (fields.birthDate && fields.birthDate > today)
    errors.birthDate = "A data de nascimento não pode ser no futuro.";

  const cep = onlyDigits(fields.cep);
  if (cep) {
    if (cep.length !== 8) errors.cep = "Informe o CEP com 8 dígitos.";
    else if (!fields.cityName)
      errors.cep = "Busque o CEP para preencher a cidade.";
    if (!fields.street.trim()) errors.street = "Informe a rua.";
    if (!fields.number.trim()) errors.number = "Informe o número.";
  }
  return errors;
}

/** Texto opcional: vazio vira null (a API limpa o campo). */
export const orNull = (value: string): string | null =>
  value.trim() ? value.trim() : null;
