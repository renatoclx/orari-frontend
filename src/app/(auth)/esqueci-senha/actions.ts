"use server";

import { headers } from "next/headers";
import { FORWARDED_FOR_HEADER, clientIpFrom } from "@/lib/client-ip";
import { ApiError } from "@/services/api";
import * as authService from "@/services/auth.service";

export type ForgotPasswordResult =
  { ok: true } | { ok: false; field?: "email"; message: string };

// Validação mínima de formato; quem confere de verdade é a API.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pede o link de "Esqueci minha senha" (screens/login.md). A API responde
 * sempre igual, exista o e-mail ou não: a tela também mostra sempre a mesma
 * mensagem.
 */
export async function forgotPasswordAction(
  email: string,
): Promise<ForgotPasswordResult> {
  const value = email.trim();
  if (!EMAIL_PATTERN.test(value)) {
    return {
      ok: false,
      field: "email",
      message: "Informe um e-mail válido (ex.: nome@empresa.com).",
    };
  }
  // O IP do usuário vale para o limite de pedidos por conexão.
  const clientIp = clientIpFrom((await headers()).get(FORWARDED_FOR_HEADER));
  try {
    await authService.requestPasswordReset(value, clientIp);
    return { ok: true };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 429) {
      return {
        ok: false,
        message:
          "Muitos pedidos seguidos. Aguarde alguns minutos e tente de novo.",
      };
    }
    return { ok: false, message: error.message };
  }
}
