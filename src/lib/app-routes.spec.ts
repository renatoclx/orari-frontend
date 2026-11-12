import { describe, expect, it } from "vitest";
import {
  appRouteKind,
  appSessionKind,
  proRouteAllowed,
  safeReturnPath,
} from "@/lib/app-routes";

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
    expect(appRouteKind("/app/local/studio-aurora-demo")).toBe("open");
  });

  it("o resto do app: precisa da conta", () => {
    expect(appRouteKind("/app")).toBe("private");
    expect(appRouteKind("/app/menu")).toBe("private");
  });
});

describe("safeReturnPath", () => {
  it("aceita só caminhos do app", () => {
    expect(safeReturnPath("/app/local/aurora")).toBe("/app/local/aurora");
    expect(safeReturnPath("https://outro.site/app/x")).toBeUndefined();
    expect(safeReturnPath("//outro.site")).toBeUndefined();
    expect(safeReturnPath("/clientes")).toBeUndefined();
    expect(safeReturnPath(undefined)).toBeUndefined();
  });
});

describe("appSessionKind", () => {
  it("sem nenhum cookie, ninguém entrou", () => {
    expect(appSessionKind({})).toBeNull();
  });

  it("o cookie da conta é o cliente", () => {
    expect(appSessionKind({ clientToken: "t" })).toBe("client");
  });

  it("o acesso ou a renovação do usuário são o profissional (a renovação sozinha basta: o proxy renova o acesso)", () => {
    expect(appSessionKind({ proAccess: "a" })).toBe("professional");
    expect(appSessionKind({ proRefresh: "r" })).toBe("professional");
  });

  it("com os dois, vale o profissional, que é o mais restrito", () => {
    expect(appSessionKind({ clientToken: "t", proRefresh: "r" })).toBe(
      "professional",
    );
  });
});

describe("proRouteAllowed", () => {
  it("abre o Início, o Menu, a troca de senha e as rotas de apoio", () => {
    for (const path of [
      "/app",
      "/app/",
      "/app/menu",
      "/app/menu/senha",
      "/app/sessao-encerrada",
      "/app/manifest.webmanifest",
    ]) {
      expect(proRouteAllowed(path)).toBe(true);
    }
  });

  it("não abre as telas do cliente", () => {
    for (const path of [
      "/app/buscar",
      "/app/agendamentos",
      "/app/local/studio-aurora",
      "/app/local/studio-aurora/agendar",
      "/app/menu/dados",
      "/app/menu/pacotes",
      "/app/menu/recorrencias",
      "/app/menu/avisos",
      "/app/acesso/abc",
    ]) {
      expect(proRouteAllowed(path)).toBe(false);
    }
  });
});
