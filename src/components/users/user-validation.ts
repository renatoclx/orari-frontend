import type { UserType } from "@/types/auth";
import type { LinkedPersonType } from "@/types/user";

// Campos validados no cliente e de novo no servidor (mesmas regras do backend).
export type UserFormValues = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  type: string;
  /** Função do usuário: com quem ele se vincula ("" = sem vínculo). */
  linkType: LinkedPersonType | "";
  /** Pessoa escolhida (só vale com `linkType`). */
  peopleId: string;
  /** Login do usuário só de app no aplicativo (só vale no tipo PROFESSIONAL). */
  phone: string;
};

/**
 * Cria um tipo para armazenar erros de validação do formulário de usuário
 *
 * keyof UserFormValues -> Pega todas as chaves de UserFormValues;
 * Record<> -> cria um objeto onde cada chave possui uma string;
 * Partial<> -> Torna as propriedades opcionais;
 */
export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

// Ordem em que os campos aparecem no formulário: o foco vai para o primeiro inválido.
export const userFieldOrder: (keyof UserFormValues)[] = [
  "name",
  "email",
  "type",
  "peopleId",
  "phone",
  "password",
  "passwordConfirmation",
];

// Tipos que existem no backend (enum UserType).
const USER_TYPES: UserType[] = ["SUPER_ADMIN", "ADMIN", "USER", "PROFESSIONAL"];

// Regras de senha do backend (is-user-password.decorator.ts): de 8 a 72. O
// limite de 72 é em bytes, porque o bcrypt só considera os primeiros 72 bytes;
// letras acentuadas ocupam 2 bytes.
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

// Formato básico de e-mail (o backend confere de novo com @IsEmail).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nome e e-mail: valem no cadastro e na alteração.
function validateIdentity(
  values: Pick<UserFormValues, "name" | "email" | "type">,
): UserFormErrors {
  const errors: UserFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Informe o nome do usuário.";
  }

  if (!values.email.trim()) {
    errors.email = "Informe o e-mail do usuário.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!values.type) {
    errors.type = "Selecione o tipo do usuário.";
  } else if (!USER_TYPES.includes(values.type as UserType)) {
    errors.type = "Tipo de usuário inválido.";
  }

  return errors;
}

/**
 * O vínculo só vale com uma função escolhida; o SUPER_ADMIN não se vincula (a
 * tela esconde a opção), então nada a conferir nele. O usuário só de app
 * (PROFESSIONAL) sempre se vincula, e só a um profissional.
 */
export function linkApplies(
  values: Pick<UserFormValues, "type" | "linkType">,
): boolean {
  if (values.type === "PROFESSIONAL") return true;
  return values.linkType !== "" && values.type !== "SUPER_ADMIN";
}

// Com função escolhida, a pessoa (profissional ou funcionário) é obrigatória.
function validateLink(
  values: Pick<UserFormValues, "type" | "linkType" | "peopleId">,
): UserFormErrors {
  if (!linkApplies(values)) return {};
  // Só de app: funcionário não vale (a API também recusa).
  if (values.type === "PROFESSIONAL" && values.linkType !== "PROFESSIONAL") {
    return { peopleId: "Selecione o profissional." };
  }
  if (values.peopleId) return {};
  return {
    peopleId:
      values.linkType === "EMPLOYEE"
        ? "Selecione o funcionário."
        : "Selecione o profissional.",
  };
}

/** Telefone com DDD (10 ou 11 dígitos), como a API aceita. */
const PHONE_DIGITS = /^\d{10,11}$/;

/** O telefone de acesso só existe no usuário só de app, e lá é obrigatório. */
function validatePhone(
  values: Pick<UserFormValues, "type" | "phone">,
): UserFormErrors {
  if (values.type !== "PROFESSIONAL") return {};
  const digits = values.phone.replace(/\D/g, "");
  if (!digits) return { phone: "Informe o telefone de acesso ao app." };
  return PHONE_DIGITS.test(digits)
    ? {}
    : { phone: "Informe o telefone com DDD (10 ou 11 dígitos)." };
}

/**
 * Senha e confirmação: cadastro e troca de senha. A senha não passa por `trim`:
 * espaços fazem parte dela.
 */
export function validatePassword(
  password: string,
  confirmation: string,
): Pick<UserFormErrors, "password" | "passwordConfirmation"> {
  const errors: Pick<UserFormErrors, "password" | "passwordConfirmation"> = {};

  if (!password) {
    errors.password = "Informe a senha.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  } else if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    errors.password = "A senha é longa demais (até 72 caracteres sem acento).";
  }

  // Um erro por vez: primeiro a falta, depois a diferença.
  if (!confirmation) {
    errors.passwordConfirmation = "Confirme a senha.";
  } else if (password !== confirmation) {
    errors.passwordConfirmation = "As senhas não conferem.";
  }

  return errors;
}

/** Cadastro: todos os campos. */
export function validateUserForm(values: UserFormValues): UserFormErrors {
  return {
    ...validateIdentity(values),
    ...validateLink(values),
    ...validatePhone(values),
    ...validatePassword(values.password, values.passwordConfirmation),
  };
}

/** Alteração: nome, e-mail e tipo (a senha tem rota própria). */
export function validateUpdateUserForm(
  values: Pick<
    UserFormValues,
    "name" | "email" | "type" | "linkType" | "peopleId" | "phone"
  >,
): UserFormErrors {
  return {
    ...validateIdentity(values),
    ...validateLink(values),
    ...validatePhone(values),
  };
}
