import { onlyDigits } from "@/utils/masks";

export type ClientFormValues = {
  name: string;
  /** Contato principal; aceita com ou sem máscara. */
  phone: string;
  email: string;
  /** CPF; aceita com ou sem máscara. */
  document: string;
};

export type ClientFormErrors = Partial<Record<keyof ClientFormValues, string>>;

// Ordem em que os campos aparecem na tela: o foco vai para o primeiro inválido.
export const clientFieldOrder: (keyof ClientFormValues)[] = [
  "name",
  "phone",
  "email",
  "document",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Obrigatórios (screens.md): nome e um contato (celular). Os opcionais só são
 * conferidos quando preenchidos, para não falharem depois, no cadastro.
 */
export function validateClientForm(values: ClientFormValues): ClientFormErrors {
  const errors: ClientFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Informe o nome do cliente.";
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
