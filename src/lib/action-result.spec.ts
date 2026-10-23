import { describe, expect, it, vi } from "vitest";

// O apiFetch lê a sessão pelos cookies do Next: aqui só importa o ApiError.
vi.mock("@/services/session", () => ({ getAccessToken: vi.fn() }));

import { failureFrom } from "@/lib/action-result";
import { ApiError } from "@/services/api";

describe("failureFrom", () => {
  it("transforma o erro da API em falha com a mensagem", () => {
    expect(failureFrom(new ApiError(400, "Nome inválido."))).toEqual({
      ok: false,
      message: "Nome inválido.",
    });
  });

  it("409 vai para o campo indicado (nome ou documento repetido)", () => {
    expect(
      failureFrom(new ApiError(409, "Nome já existe."), "name" as const),
    ).toEqual({ ok: false, message: "Nome já existe.", field: "name" });
  });

  it("409 sem campo indicado não aponta campo", () => {
    expect(failureFrom(new ApiError(409, "Conflito."))).toEqual({
      ok: false,
      message: "Conflito.",
    });
  });

  it("outros status não apontam campo, mesmo com campo indicado", () => {
    expect(
      failureFrom(new ApiError(400, "Inválido."), "name" as const),
    ).toEqual({ ok: false, message: "Inválido." });
    expect(
      failureFrom(new ApiError(0, "Sem conexão."), "name" as const),
    ).toEqual({ ok: false, message: "Sem conexão." });
  });

  it("erro inesperado é relançado (inclusive o redirect do Next)", () => {
    const unexpected = new Error("bug");
    const redirect = new Error("NEXT_REDIRECT");

    expect(() => failureFrom(unexpected)).toThrow(unexpected);
    expect(() => failureFrom(redirect)).toThrow(redirect);
    expect(() => failureFrom("texto")).toThrow();
  });
});
