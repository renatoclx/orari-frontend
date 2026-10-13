"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/services/api";
import { clearSession, getRefreshToken } from "@/services/session";

/**
 * Revoga a sessão no backend, apaga os cookies e volta ao login. Se a API
 * falhar, sai mesmo assim: quem clicou em "Sair" espera sair, e o refresh
 * token não revogado vence sozinho.
 */
export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
    }
  }

  await clearSession();
  // O sinal na URL faz a tela de login mostrar o toast de despedida.
  redirect("/login?loggedOut=1");
}
