import { describe, expect, it } from "vitest";
import { canAccess } from "@/utils/access";

const access = {
  features: [
    {
      feature: "clients",
      view: true,
      edit: true,
      create: false,
      remove: false,
    },
    {
      feature: "class-groups",
      view: false,
      edit: false,
      create: false,
      remove: false,
    },
  ],
};

describe("canAccess", () => {
  it("confere a ação pedida (padrão: visualizar)", () => {
    expect(canAccess(access, "clients")).toBe(true);
    expect(canAccess(access, "clients", "edit")).toBe(true);
    expect(canAccess(access, "clients", "create")).toBe(false);
  });

  it("funcionalidade sem acesso ou desconhecida é recusada", () => {
    expect(canAccess(access, "class-groups")).toBe(false);
    expect(canAccess(access, "foguete")).toBe(false);
  });

  it("sem o access (API antiga), nada é escondido", () => {
    expect(canAccess(undefined, "class-groups")).toBe(true);
  });
});
