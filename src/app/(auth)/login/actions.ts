"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FORWARDED_FOR_HEADER, clientIpFrom } from "@/lib/client-ip";
import { ApiError } from "@/services/api";
import * as authService from "@/services/auth.service";
import { setSession } from "@/services/session";

/** Estado do formulário de login, devolvido pela Server Action a cada envio. */
export type LoginFormState = {
  /** Mantido para repreencher o campo: o React limpa o formulário após a action. */
  email: string;
  fieldErrors: { email?: string; password?: string };
  /** Erro geral do formulário (credenciais recusadas, API fora do ar). */
  message?: string;
};

// Validação mínima de formato; quem confere o e-mail de verdade é a API.
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

  // O Caddy coloca o IP do usuário no x-forwarded-for; a API o usa no limite
  // de tentativas por IP.
  const clientIp = clientIpFrom((await headers()).get(FORWARDED_FOR_HEADER));

  try {
    const tokens = await authService.login(email, password, clientIp);
    await setSession(tokens);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { email, fieldErrors, message: loginErrorMessage(error) };
  }

  // Fora do try: o redirect() funciona lançando um erro especial do Next,
  // que o catch acima "engoliria".
  // O sinal na URL faz a área administrativa mostrar o toast de boas-vindas.
  redirect("/?loggedIn=1");
}

function loginErrorMessage(error: ApiError): string {
  // Genérica de propósito: não revela se o erro foi no e-mail ou na senha.
  if (error.status === 401) return "E-mail ou senha incorretos.";
  return error.message;
}
