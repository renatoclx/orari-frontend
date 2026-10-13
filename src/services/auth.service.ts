import "server-only";

import { apiFetch } from "@/services/api";
import type { AuthTokens, CurrentUser } from "@/types/auth";

// Rotas de autenticação da API. Telas, layouts e Server Actions chamam estas
// funções, nunca o apiFetch direto.

export function login(email: string, password: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/login", {
    authenticated: false,
    method: "POST",
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

export function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/auth/me");
}
