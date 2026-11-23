import "server-only";

import { cache } from "react";
import type { toSignupInput } from "@/components/auth/signup-validation";
import { forwardedForHeader } from "@/lib/client-ip";
import { apiFetch } from "@/services/api";
import type { AuthTokens, CurrentUser } from "@/types/auth";
import { withReadOnlyAccess } from "@/utils/access";

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
 * Entrada do profissional no app, pelo telefone ou pelo e-mail (`login`). Só o
 * usuário só de app entra por aqui; a API recusa (401) qualquer outro caso, com
 * a mesma resposta.
 */
export function loginProfessional(
  login: string,
  password: string,
  clientIp?: string,
): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/professional/login", {
    authenticated: false,
    method: "POST",
    headers: forwardedForHeader(clientIp),
    body: JSON.stringify({ login, password }),
  });
}

/**
 * Cadastro sozinho pela landing (screens/cadastro.md): cria a empresa em teste
 * de 7 dias e devolve os tokens, como o login. Limite por IP na API.
 */
export function signup(
  input: ReturnType<typeof toSignupInput>,
  clientIp?: string,
): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/signup", {
    authenticated: false,
    method: "POST",
    headers: forwardedForHeader(clientIp),
    body: JSON.stringify(input),
  });
}

/**
 * Troca da própria senha (pede a atual). A API encerra todas as sessões da
 * pessoa, inclusive esta: quem chama entra de novo com a senha nova.
 */
export async function changeOwnPassword(input: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}): Promise<void> {
  await apiFetch("/auth/me/password", {
    method: "PATCH",
    body: JSON.stringify(input),
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
 * usuário na mesma requisição. Com a assinatura em somente leitura, os acessos
 * já chegam só com o Visualiza: os botões de gravar somem em todas as telas.
 */
export const getCurrentUser = cache(async () =>
  withReadOnlyAccess(await apiFetch<CurrentUser>("/auth/me")),
);
