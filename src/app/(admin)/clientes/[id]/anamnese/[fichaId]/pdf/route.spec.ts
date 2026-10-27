import { beforeEach, describe, expect, it, vi } from "vitest";

// A sessão lê cookies do Next e o apiFetch usa o redirect: aqui só importa o
// que a rota faz com o resultado do serviço.
vi.mock("@/services/session", () => ({ getAccessToken: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/services/anamnesis.service", () => ({ getAnamnesisPdf: vi.fn() }));

import { ApiError } from "@/services/api";
import { getAnamnesisPdf } from "@/services/anamnesis.service";
import { GET } from "./route";

const ID = "8b35556b-c495-4238-874a-c36c607597c6";
const getPdf = vi.mocked(getAnamnesisPdf);

const call = (fichaId: string, query = "") =>
  GET(new Request(`http://app.test/pdf${query}`), {
    params: Promise.resolve({ id: "c", fichaId }),
  } as never);

describe("GET /clientes/[id]/anamnese/[fichaId]/pdf", () => {
  beforeEach(() => {
    // Com chaves: o mockReset devolve o próprio mock, e o beforeEach o chamaria
    // como limpeza ao fim de cada teste.
    getPdf.mockReset();
  });

  it("devolve os bytes do PDF, sem cache e com nome genérico", async () => {
    getPdf.mockResolvedValue({
      bytes: new TextEncoder().encode("%PDF-1.7").buffer as ArrayBuffer,
      contentType: "application/pdf",
    });

    const response = await call(ID);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-disposition")).toBe(
      'inline; filename="ficha-anamnese.pdf"',
    );
    expect(await response.text()).toBe("%PDF-1.7");
  });

  it("inclui o histórico por padrão e só o tira com includeHistory=false", async () => {
    getPdf.mockResolvedValue({
      bytes: new ArrayBuffer(0),
      contentType: "application/pdf",
    });

    await call(ID);
    await call(ID, "?includeHistory=false");
    await call(ID, "?includeHistory=true");

    expect(getPdf.mock.calls.map(([, include]) => include)).toEqual([
      true,
      false,
      true,
    ]);
  });

  it("id que não é UUID é 404 e nem chama a API", async () => {
    const response = await call("..%2F..%2Fusers");

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(getPdf).not.toHaveBeenCalled();
  });

  it("repassa o erro da API em JSON, com o mesmo status", async () => {
    getPdf.mockImplementation(async () => {
      throw new ApiError(403, "Sem acesso");
    });

    const response = await call(ID);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ message: "Sem acesso" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("falha de conexão (status 0) vira 502", async () => {
    getPdf.mockImplementation(async () => {
      throw new ApiError(0, "Não foi possível conectar ao servidor.");
    });

    expect((await call(ID)).status).toBe(502);
  });

  it("erro inesperado não é engolido", async () => {
    getPdf.mockImplementation(async () => {
      throw new Error("boom");
    });

    await expect(call(ID)).rejects.toThrow("boom");
  });
});
