import { describe, expect, it } from "vitest";
import { appRouteKind } from "@/lib/app-routes";

describe("appRouteKind", () => {
  it("fora do app: null (inclusive o que só começa com /app)", () => {
    expect(appRouteKind("/clientes")).toBeNull();
    expect(appRouteKind("/apple-icon.png")).toBeNull();
    expect(appRouteKind("/application")).toBeNull();
    expect(appRouteKind("/app-assets/icon-192.png")).toBeNull();
  });

  it("entrar e criar conta: só para quem não entrou", () => {
    expect(appRouteKind("/app/entrar")).toBe("guest");
    expect(appRouteKind("/app/criar-conta")).toBe("guest");
  });

  it("link de acesso e fim da sessão: abertas", () => {
    expect(appRouteKind("/app/acesso/abc")).toBe("open");
    expect(appRouteKind("/app/sessao-encerrada")).toBe("open");
    expect(appRouteKind("/app/manifest.webmanifest")).toBe("open");
  });

  it("o resto do app: precisa da conta", () => {
    expect(appRouteKind("/app")).toBe("private");
    expect(appRouteKind("/app/menu")).toBe("private");
  });
});
