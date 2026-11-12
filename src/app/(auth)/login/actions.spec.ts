import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock sobe para o topo do arquivo: o que ele usa precisa nascer com vi.hoisted.
const { loginMock, logoutMock, userMock, setSessionMock, headersMock } =
  vi.hoisted(() => ({
    loginMock: vi.fn(),
    logoutMock: vi.fn(),
    userMock: vi.fn(),
    setSessionMock: vi.fn(),
    headersMock: vi.fn(),
  }));

vi.mock("next/headers", () => ({ headers: () => headersMock() }));
vi.mock("next/navigation", () => ({
  // O redirect do Next funciona lançando um erro.
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));
vi.mock("@/services/auth.service", () => ({
  login: loginMock,
  logout: logoutMock,
  fetchUserByToken: userMock,
}));
vi.mock("@/services/session", () => ({ setSession: setSessionMock }));
// O tipo de erro da API vem do apiFetch, que importa "server-only" e o Next.
vi.mock("@/services/api", () => ({
  ApiError: class ApiError extends Error {
    constructor(
      public readonly status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

import { login } from "@/app/(auth)/login/actions";

function form(email: string, password: string): FormData {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  return data;
}

describe("login (Server Action)", () => {
  beforeEach(() => {
    loginMock.mockReset();
    loginMock.mockResolvedValue({ accessToken: "a", refreshToken: "r" });
    logoutMock.mockReset();
    logoutMock.mockResolvedValue(undefined);
    userMock.mockReset();
    userMock.mockResolvedValue({ type: "ADMIN" });
    setSessionMock.mockReset();
    headersMock.mockReset();
  });

  it("o profissional (só app) não entra pelo web: nada é gravado e o refresh token é revogado", async () => {
    headersMock.mockResolvedValue(new Headers());
    userMock.mockResolvedValue({ type: "PROFESSIONAL" });

    const result = await login(undefined, form("pro@b.com", "12345678"));

    expect(result.message).toContain("aplicativo");
    expect(setSessionMock).not.toHaveBeenCalled();
    expect(logoutMock).toHaveBeenCalledWith("r");
    expect(userMock).toHaveBeenCalledWith("a");
  });

  it("repassa à API o IP que o Caddy colocou no x-forwarded-for", async () => {
    headersMock.mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.7, 172.18.0.2" }),
    );

    await expect(login(undefined, form("a@b.com", "12345678"))).rejects.toThrow(
      "REDIRECT:/?loggedIn=1",
    );

    expect(loginMock).toHaveBeenCalledWith(
      "a@b.com",
      "12345678",
      "203.0.113.7",
    );
  });

  it("não envia IP quando a requisição não traz o cabeçalho", async () => {
    headersMock.mockResolvedValue(new Headers());

    await expect(login(undefined, form("a@b.com", "12345678"))).rejects.toThrow(
      "REDIRECT",
    );

    expect(loginMock).toHaveBeenCalledWith("a@b.com", "12345678", undefined);
  });

  it("não chama a API quando o formulário é inválido", async () => {
    headersMock.mockResolvedValue(new Headers());

    const state = await login(undefined, form("", ""));

    expect(state.fieldErrors.email).toBeDefined();
    expect(loginMock).not.toHaveBeenCalled();
  });
});
