import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

// Um JWT só para o proxy ler a validade (a assinatura não é conferida aqui).
function fakeJwt(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 900 }),
  ).toString("base64url");
  return `h.${payload}.s`;
}

describe("proxy: renovação da sessão", () => {
  const fetchMock = vi.fn();
  let token = 0;

  beforeEach(() => {
    vi.stubEnv("API_URL", "http://api.test");
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ accessToken: fakeJwt(), refreshToken: "novo" }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  // Um refresh token diferente por teste: o proxy compartilha a renovação em
  // andamento (e por 10 s o resultado) entre requisições do mesmo token.
  function requestWith(forwardedFor?: string) {
    token += 1;
    return new NextRequest("https://app.orariapp.com.br/clientes", {
      headers: {
        cookie: `orari_refresh=refresh-${token}`,
        ...(forwardedFor !== undefined && { "x-forwarded-for": forwardedFor }),
      },
    });
  }

  function refreshHeaders(): Record<string, string> {
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/auth/refresh");
    return init.headers as Record<string, string>;
  }

  it("envia à API o IP do usuário (primeiro valor do x-forwarded-for)", async () => {
    await proxy(requestWith("203.0.113.7, 172.18.0.2"));

    expect(refreshHeaders()["X-Forwarded-For"]).toBe("203.0.113.7");
  });

  it("não envia o cabeçalho quando a requisição não traz o IP", async () => {
    await proxy(requestWith());

    expect(refreshHeaders()).not.toHaveProperty("X-Forwarded-For");
  });

  it("não repassa um valor que não é IP", async () => {
    await proxy(requestWith("não-é-ip"));

    expect(refreshHeaders()).not.toHaveProperty("X-Forwarded-For");
  });

  it("segue enviando o JSON e o refresh token no corpo", async () => {
    await proxy(requestWith("203.0.113.7"));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(refreshHeaders()["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual({
      refreshToken: expect.stringMatching(/^refresh-/),
    });
  });
});

describe("proxy: proteção das rotas", () => {
  afterEach(() => vi.unstubAllEnvs());

  const anonymous = () =>
    new NextRequest("https://app.orariapp.com.br/clientes");

  it("sem sessão, leva ao login", async () => {
    const response = await proxy(anonymous());

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
  });

  it("AUTH_GUARD=off libera as rotas em desenvolvimento", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_GUARD", "off");

    const response = await proxy(anonymous());

    expect(response.headers.get("location")).toBeNull();
  });

  it("AUTH_GUARD=off não vale em produção", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_GUARD", "off");

    const response = await proxy(anonymous());

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
  });
});
