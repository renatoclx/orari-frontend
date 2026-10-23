import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A sessão lê cookies do Next: aqui o login é público e não pede token.
vi.mock("@/services/session", () => ({ getAccessToken: vi.fn() }));
// `cache` do React só existe no servidor do Next; aqui só repassa a função.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache: <T>(fn: T) => fn,
}));

import { login } from "@/services/auth.service";

const tokens = { accessToken: "a", refreshToken: "r" };

describe("login (service)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("API_URL", "http://api.test");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(tokens), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  function sentHeaders(): Record<string, string> {
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    return init.headers as Record<string, string>;
  }

  it("envia o IP do usuário à API em X-Forwarded-For", async () => {
    await login("a@b.com", "12345678", "203.0.113.7");

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("http://api.test/auth/login");
    expect(sentHeaders()["X-Forwarded-For"]).toBe("203.0.113.7");
  });

  it("não envia o cabeçalho quando não há IP", async () => {
    await login("a@b.com", "12345678");

    expect(sentHeaders()).not.toHaveProperty("X-Forwarded-For");
  });

  it("não manda token na rota pública", async () => {
    await login("a@b.com", "12345678", "203.0.113.7");

    expect(sentHeaders()).not.toHaveProperty("Authorization");
  });
});
