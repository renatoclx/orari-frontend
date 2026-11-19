import { isValidCnpj, isValidCpf, normalizeDocument } from "@/utils/document";
import { phoneDigits } from "@/utils/masks";
import type { SubscriptionPlan } from "@/types/subscription";

// Cadastro sozinho (screens/cadastro.md): as mesmas regras do backend
// (SignupDto), para a tela avisar antes de enviar. Quem decide é a API.

export type SignupValues = {
  companyName: string;
  document: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  /** Só na tela: confere a senha digitada; não vai para a API. */
  passwordConfirmation: string;
  plan: SubscriptionPlan;
  acceptTerms: boolean;
};

export type SignupErrors = Partial<Record<keyof SignupValues, string>>;

/** O plano vem da landing (?plano=essencial|plus|clinical); sem ele, o Plus. */
export function planFromQuery(value: unknown): SubscriptionPlan {
  if (value === "essencial") return "ESSENTIAL";
  if (value === "clinical") return "CLINICAL";
  return "PLUS";
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(values: SignupValues): SignupErrors {
  const errors: SignupErrors = {};
  if (values.companyName.trim().length < 2) {
    errors.companyName = "Informe o nome do seu negócio.";
  }
  const document = normalizeDocument(values.document);
  if (document.length === 11) {
    if (!isValidCpf(document)) errors.document = "CPF inválido.";
  } else if (document.length === 14) {
    if (!isValidCnpj(document)) errors.document = "CNPJ inválido.";
  } else {
    errors.document = "Informe o CPF ou o CNPJ.";
  }
  if (!values.name.trim()) errors.name = "Informe o seu nome.";
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido (ex.: nome@empresa.com).";
  }
  if (!/^\d{10,11}$/.test(phoneDigits(values.phone))) {
    errors.phone = "Informe o celular com DDD.";
  }
  if (values.password.length < 8) {
    errors.password = "A senha precisa ter pelo menos 8 caracteres.";
  } else if (values.password.length > 72) {
    errors.password = "A senha pode ter no máximo 72 caracteres.";
  }
  if (!values.passwordConfirmation) {
    errors.passwordConfirmation = "Repita a senha.";
  } else if (values.passwordConfirmation !== values.password) {
    errors.passwordConfirmation = "As senhas não são iguais.";
  }
  if (!values.acceptTerms) {
    errors.acceptTerms = "Aceite os termos para continuar.";
  }
  return errors;
}

/** Corpo do POST /auth/signup: documento e celular só com os caracteres que valem. */
export function toSignupInput(values: SignupValues) {
  return {
    companyName: values.companyName.trim(),
    document: normalizeDocument(values.document),
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: phoneDigits(values.phone),
    password: values.password,
    plan: values.plan,
    acceptTerms: values.acceptTerms,
  };
}
