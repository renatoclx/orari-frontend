import type { UserType } from "@/types/auth";

// Campos validados no cliente e de novo no servidor (mesmas regras do backend).
export type UserFormValues = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  type: string;
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
  "password",
  "passwordConfirmation",
];

// Tipos que existem no backend (enum UserType).
const USER_TYPES: UserType[] = ["SUPER_ADMIN", "ADMIN", "USER"];

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
    ...validatePassword(values.password, values.passwordConfirmation),
  };
}

/** Alteração: nome, e-mail e tipo (a senha tem rota própria). */
export function validateUpdateUserForm(
  values: Pick<UserFormValues, "name" | "email" | "type">,
): UserFormErrors {
  return validateIdentity(values);
}
