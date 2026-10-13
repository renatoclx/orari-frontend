import "server-only";

import { getAccessToken } from "@/services/session";

/** Erro de uma chamada à API, com o status HTTP e uma mensagem para a tela. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Formato dos erros do NestJS: { statusCode, message, error }.
// O `message` vem como lista quando a validação de vários campos falha.
type NestErrorBody = {
  message?: string | string[];
};

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

function errorMessage(body: unknown): string {
  const message = (body as NestErrorBody | undefined)?.message;
  if (Array.isArray(message)) return message.join(" ");
  return message ?? "Não foi possível concluir a operação.";
}

/**
 * Ponto único de chamada à API. Só roda no servidor: o API_URL não chega ao
 * navegador, e o import de "server-only" faz o build falhar se um Client
 * Component tentar usar este arquivo.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL não definida. Confira o .env.local.");
  }

  // Como um interceptor de requisição: o token da sessão vai em toda chamada.
  const token = await getAccessToken();

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      // Dados da empresa mudam o tempo todo: nada de cache entre requisições.
      cache: "no-store",
    });
  } catch {
    // O fetch só lança quando não há resposta nenhuma (API fora do ar, rede).
    throw new ApiError(0, "Não foi possível conectar ao servidor.");
  }

  const body = await readBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(body));
  }

  return body as T;
}
