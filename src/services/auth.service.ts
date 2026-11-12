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

/**
 * Entrada do profissional no app, pelo telefone (como o cliente). Só o usuário
 * só de app entra por aqui; a API recusa (401) qualquer outro caso, com a mesma
 * resposta.
 */
export function loginProfessional(
  phone: string,
  password: string,
  clientIp?: string,
): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/professional/login", {
    authenticated: false,
    method: "POST",
    headers: forwardedForHeader(clientIp),
    body: JSON.stringify({ phone, password }),
  });
}

/**
 * Usuário de um access token em mãos, antes de gravar a sessão (o login confere
 * o tipo: o profissional entra só pelo app). Não usa os cookies.
 */
export function fetchUserByToken(accessToken: string): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/auth/me", {
    authenticated: false,
    headers: { Authorization: `Bearer ${accessToken}` },
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
