import { isValidCnpj, isValidCpf, normalizeDocument } from "@/utils/document";
import { isDateString } from "@/utils/time";

/** Campos do formulário de empresa (validados na tela e de novo no servidor). */
export type CompanyFormValues = {
  corporateReason: string;
  fantasyName: string;
  /** CPF ou CNPJ, com ou sem máscara. */
  document: string;
  /** "aaaa-mm-dd"; vazio = sem data (não se aplica a quem usa CPF). */
  foundationDate: string;
  subdomain: string;
  timezone: string;
};

export type CompanyFormErrors = Partial<
  Record<keyof CompanyFormValues, string>
>;

// Ordem em que os campos aparecem: o foco vai para o primeiro inválido.
export const companyFieldOrder: (keyof CompanyFormValues)[] = [
  "corporateReason",
  "fantasyName",
  "document",
  "foundationDate",
  "subdomain",
  "timezone",
];

/** Nome fantasia: até 100 caracteres (regra do backend). */
export const MAX_FANTASY_NAME = 100;

// Letras minúsculas, números e hífens, sem hífen nas pontas (regra do backend).
const SUBDOMAIN_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** CPF (11 dígitos) ou CNPJ (14 caracteres)? O tamanho decide. */
export function documentKind(document: string): "CPF" | "CNPJ" | null {
  const length = normalizeDocument(document).length;
  if (length === 11) return "CPF";
  if (length === 14) return "CNPJ";
  return null;
}

/** Mesmas regras do backend (business-rules.md, "Empresas"). */
export function validateCompanyForm(
  values: CompanyFormValues,
): CompanyFormErrors {
  const errors: CompanyFormErrors = {};

  if (!values.corporateReason.trim()) {
    errors.corporateReason =
      "Informe a razão social (para CPF, o nome da pessoa).";
  }

  if (values.fantasyName.trim().length > MAX_FANTASY_NAME) {
    errors.fantasyName = `O nome fantasia tem até ${MAX_FANTASY_NAME} caracteres.`;
  }

  const document = normalizeDocument(values.document);
  if (!document) {
    errors.document = "Informe o CPF ou o CNPJ.";
  } else if (document.length === 11) {
    if (!isValidCpf(document)) errors.document = "CPF inválido.";
  } else if (document.length === 14) {
    if (!isValidCnpj(document)) errors.document = "CNPJ inválido.";
  } else {
    errors.document = "Informe um CPF (11 dígitos) ou um CNPJ (14 caracteres).";
  }

  if (values.foundationDate && !isDateString(values.foundationDate)) {
    errors.foundationDate = "Informe uma data válida.";
  }

  if (!values.subdomain) {
    errors.subdomain = "Informe o subdomínio.";
  } else if (!SUBDOMAIN_PATTERN.test(values.subdomain)) {
    errors.subdomain =
      "Use só letras minúsculas, números e hífens (ex.: clinica-sol).";
  }

  if (!values.timezone) {
    errors.timezone = "Selecione o fuso horário.";
  }

  return errors;
}
