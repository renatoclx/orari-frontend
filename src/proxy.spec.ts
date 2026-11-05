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

describe("proxy: app do cliente (/app)", () => {
  const at = (path: string, cookie?: string) =>
    new NextRequest(`https://app.orariapp.com.br${path}`, {
      headers: cookie ? { cookie } : {},
    });
  const location = (response: Response) => response.headers.get("location");

  it("sem a conta: telas de quem entrou levam a entrar", async () => {
    expect(location(await proxy(at("/app")))).toBe(
      "https://app.orariapp.com.br/app/entrar",
    );
  });

  it("entrado: entrar e criar conta levam ao Início", async () => {
    expect(location(await proxy(at("/app/criar-conta", "orari_app=t")))).toBe(
      "https://app.orariapp.com.br/app",
    );
  });

  it("o link de acesso abre com ou sem a conta", async () => {
    expect(location(await proxy(at("/app/acesso/abc")))).toBeNull();
    expect(
      location(await proxy(at("/app/acesso/abc", "orari_app=t"))),
    ).toBeNull();
  });

  it("os cookies da clínica não valem no app, e o do app não vale na clínica", async () => {
    expect(
      location(await proxy(at("/app", "orari_access=x; orari_refresh=y"))),
    ).toBe("https://app.orariapp.com.br/app/entrar");
    expect(location(await proxy(at("/clientes", "orari_app=t")))).toBe(
      "https://app.orariapp.com.br/login",
    );
  });
});
