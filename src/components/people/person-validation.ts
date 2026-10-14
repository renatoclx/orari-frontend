import { onlyDigits } from "@/utils/masks";

/** Campos validados no cliente e de novo no servidor. */
export type PersonFormValues = {
  name: string;
  /** Contato principal; aceita com ou sem máscara. */
  phone: string;
  email: string;
  /** CPF; aceita com ou sem máscara. */
  document: string;
};

export type PersonFormErrors = Partial<Record<keyof PersonFormValues, string>>;

// Ordem em que os campos aparecem na tela: o foco vai para o primeiro inválido.
export const personFieldOrder: (keyof PersonFormValues)[] = [
  "name",
  "phone",
  "email",
  "document",
];

// Formato mínimo; a API confere o e-mail de verdade.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Obrigatórios (screens.md): nome e um contato (celular). Os opcionais só são
 * conferidos quando preenchidos, para não falharem depois, no cadastro.
 */
export function validatePersonForm(values: PersonFormValues): PersonFormErrors {
  const errors: PersonFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Informe o nome.";
  }

  const phone = onlyDigits(values.phone);
  if (!phone) {
    errors.phone = "Informe um contato.";
  } else if (phone.length < 10) {
    errors.phone = "Informe um telefone válido, com DDD.";
  }

  const email = values.email.trim();
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Informe um e-mail válido, como nome@exemplo.com.";
  }

  const document = onlyDigits(values.document);
  if (document && document.length !== 11) {
    errors.document = "Informe os 11 dígitos do CPF.";
  }

  return errors;
}
