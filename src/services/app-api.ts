import "server-only";

import { redirect } from "next/navigation";
import { ApiError, errorMessage, readBody } from "@/services/api";
import { getAppToken } from "@/services/app-session";

// Rota que apaga o cookie do app e leva à tela de entrar (páginas não podem apagar cookies).
const APP_SESSION_ENDED_PATH = "/app/sessao-encerrada";

type AppFetchOptions = RequestInit & {
  /**
   * true: exige a sessão do app (401 encerra a sessão). "optional": manda o
   * token se houver (link de acesso). false: rota pública.
   */
  authenticated?: boolean | "optional";
};

/**
 * Chamadas do app do cliente à API, com o token do app (nunca o da clínica).
 * Mesmo formato de erro do `apiFetch`: qualquer resposta de erro vira `ApiError`.
 */
export async function appFetch<T>(
  path: string,
  { authenticated = true, ...options }: AppFetchOptions = {},
): Promise<T> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL não definida. Confira o .env.local.");
  }

  const token = authenticated ? await getAppToken() : undefined;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        // Em multipart (a foto), o fetch define o Content-Type com o limite.
        ...(!(options.body instanceof FormData) && {
          "Content-Type": "application/json",
        }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor.");
  }

  const body = await readBody(response);

  // Sessão do app vencida ou encerrada em outro aparelho: entrar de novo.
  if (response.status === 401 && token) {
    redirect(APP_SESSION_ENDED_PATH);
  }

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(body), body);
  }

  return body as T;
}
