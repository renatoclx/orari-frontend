"use server";

export type LoginFormState = {
  /** Mantido para repreencher o campo: o React limpa o formulário após a action. */
  email: string;
  fieldErrors: { email?: string; password?: string };
  /** Erro geral do formulário (credenciais recusadas, API fora do ar). */
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida os campos no servidor, onde a regra não pode ser contornada.
 * A chamada a POST /auth/login e a gravação dos cookies entram na próxima etapa.
 */
export async function login(
  _previousState: LoginFormState | undefined,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: LoginFormState["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "Informe seu e-mail.";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Informe um e-mail válido (Ex: nome@empresa.com).";
  }

  if (!password) {
    fieldErrors.password = "Informe sua senha.";
  }

  return { email, fieldErrors };
}
