import "server-only";

import { cache } from "react";
import { forwardedForHeader } from "@/lib/client-ip";
import { apiFetch } from "@/services/api";
import type { AuthTokens, CurrentUser } from "@/types/auth";

// Rotas de autenticação da API. Telas, layouts e Server Actions chamam estas
// funções, nunca o apiFetch direto.

/**
 * `clientIp`: IP do usuário, para o limite de tentativas da API valer por
 * pessoa (ela só enxerga o servidor do Next).
 */
export function login(
  email: string,
  password: string,
  clientIp?: string,
): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/login", {
    authenticated: false,
    method: "POST",
    headers: forwardedForHeader(clientIp),
    body: JSON.stringify({ email, password }),
  });
}

/** Revoga o refresh token no backend (a sessão deixa de poder ser renovada). */
export function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>("/auth/logout", {
    authenticated: false,
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

/**
 * Usuário da sessão e a empresa dele; a API recusa (401) se a sessão acabou.
 * O `cache` evita repetir a chamada quando o layout e a página precisam do
 * usuário na mesma requisição.
 */
export const getCurrentUser = cache(() => apiFetch<CurrentUser>("/auth/me"));
