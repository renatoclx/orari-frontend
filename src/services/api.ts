import "server-only";

import { redirect } from "next/navigation";
import { getAccessToken } from "@/services/session";

// Rota que apaga os cookies e leva ao login (páginas não podem apagar cookies).
const SESSION_EXPIRED_PATH = "/session-expired";

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

// 204 não tem corpo; as demais respostas são JSON ou texto.
async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

// O NestJS devolve `message` como lista quando vários campos falham na validação.
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
type ApiFetchOptions = RequestInit & {
  /** false nas rotas públicas (login, logout): não envia o token. */
  authenticated?: boolean;
};

/** Chama a API e devolve o corpo; qualquer resposta de erro vira `ApiError`. */
export async function apiFetch<T>(
  path: string,
  { authenticated = true, ...options }: ApiFetchOptions = {},
): Promise<T> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL não definida. Confira o .env.local.");
  }

  // Como um interceptor de requisição: o token da sessão vai em toda chamada.
  const token = authenticated ? await getAccessToken() : undefined;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        // Em multipart (arquivo), o fetch define o Content-Type com o limite.
        ...(!(options.body instanceof FormData) && {
          "Content-Type": "application/json",
        }),
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

  // Chamada autenticada recusada (sem token, token revogado, usuário excluído,
  // empresa inativa): a sessão acabou. O redirect lança um erro próprio do
  // Next, que passa pelos catch que só tratam ApiError.
  if (response.status === 401 && authenticated) {
    redirect(SESSION_EXPIRED_PATH);
  }

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(body));
  }

  return body as T;
}

/**
 * Chamada autenticada cuja resposta é um arquivo (PDF): devolve os bytes, sem
 * passar pelo parser de JSON. Diferente de `apiFetch`, o 401 não redireciona
 * (quem chama é um Route Handler que responde ao navegador); vira `ApiError`
 * como os demais erros.
 */
export async function apiFetchBytes(
  path: string,
): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL não definida. Confira o .env.local.");
  }

  const token = await getAccessToken();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      // Dado de saúde: nada de cache.
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor.");
  }

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(await readBody(response)));
  }
  return {
    bytes: await response.arrayBuffer(),
    contentType: response.headers.get("content-type") ?? "application/pdf",
  };
}
