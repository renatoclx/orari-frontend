"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/services/api";
import { setSession } from "@/services/session";
import type { AuthTokens } from "@/types/auth";

export type LoginFormState = {
  /** Mantido para repreencher o campo: o React limpa o formulário após a action. */
  email: string;
  fieldErrors: { email?: string; password?: string };
  /** Erro geral do formulário (credenciais recusadas, API fora do ar). */
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida os campos no servidor, onde a regra não pode ser contornada, e faz
 * o login na API. Com sucesso, grava os cookies da sessão e vai para a agenda.
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

  if (fieldErrors.email || fieldErrors.password) {
    return { email, fieldErrors };
  }

  try {
    const tokens = await apiFetch<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await setSession(tokens);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { email, fieldErrors, message: loginErrorMessage(error) };
  }

  // Fora do try: o redirect() funciona lançando um erro especial do Next,
  // que o catch acima "engoliria".
  redirect("/");
}

function loginErrorMessage(error: ApiError): string {
  // Genérica de propósito: não revela se o erro foi no e-mail ou na senha.
  if (error.status === 401) return "E-mail ou senha incorretos.";
  return error.message;
}
