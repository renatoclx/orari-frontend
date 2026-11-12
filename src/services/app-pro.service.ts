import "server-only";

import { cache } from "react";
import { proFetch } from "@/services/app-pro-api";
import type { CurrentUser } from "@/types/auth";

// Rotas da API usadas pelo app do profissional (screens/app-profissional.md).

/**
 * Quem entrou: o usuário e a empresa. O `cache` evita repetir a chamada quando
 * o layout e a página precisam do usuário na mesma requisição.
 */
export const getProfessionalMe = cache(() => proFetch<CurrentUser>("/auth/me"));

/** Troca a própria senha; a API encerra as sessões (a tela entra de novo). */
export function changeProfessionalPassword(input: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}): Promise<void> {
  return proFetch<void>("/auth/me/password", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
