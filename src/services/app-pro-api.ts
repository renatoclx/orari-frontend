import "server-only";

import { redirect } from "next/navigation";
import { ApiError, errorMessage, readBody } from "@/services/api";
import { getAppProToken } from "@/services/app-session";

// Rota que apaga os cookies do app e leva a entrar (páginas não podem apagar cookies).
const APP_SESSION_ENDED_PATH = "/app/sessao-encerrada";

type ProFetchOptions = RequestInit & {
  /**
   * Token já em mãos (o login confere o tipo do usuário antes de gravar os
   * cookies). Sem ele, vale o do cookie do app.
   */
  token?: string;
};

/**
 * Chamadas do app do profissional à API, com o token do app (nunca o do web).
 * Mesmo formato de erro do `apiFetch`: qualquer resposta de erro vira `ApiError`.
 */
export async function proFetch<T>(
  path: string,
  { token: given, ...options }: ProFetchOptions = {},
): Promise<T> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL não definida. Confira o .env.local.");
  }

  const token = given ?? (await getAppProToken());

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor.");
  }

  const body = await readBody(response);

  // Sessão vencida ou encerrada (ex.: senha trocada em outro aparelho): entrar de novo.
  if (response.status === 401 && !given) {
    redirect(APP_SESSION_ENDED_PATH);
  }

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(body), body);
  }

  return body as T;
}
