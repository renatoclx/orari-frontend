import { describe, expect, it } from "vitest";
import { anamnesisAccess } from "@/utils/anamnesis-access";

const professional = { id: "p1", name: "Dra. Paula" };

describe("anamnesisAccess", () => {
  it("o ADMIN acessa as fichas e gerencia modelos e auditoria", () => {
    expect(anamnesisAccess({ type: "ADMIN", professional: null })).toEqual({
      canAccess: true,
      isAdmin: true,
    });
  });

  it("usuário vinculado a profissional acessa as fichas, mas não gerencia", () => {
    expect(anamnesisAccess({ type: "USER", professional })).toEqual({
      canAccess: true,
      isAdmin: false,
    });
  });

  it("usuário sem vínculo (ou vinculado a funcionário) não acessa nada", () => {
    expect(anamnesisAccess({ type: "USER", professional: null })).toEqual({
      canAccess: false,
      isAdmin: false,
    });
  });

  it("o SUPER_ADMIN só acessa se estiver vinculado a um profissional", () => {
    expect(
      anamnesisAccess({ type: "SUPER_ADMIN", professional: null }),
    ).toEqual({
      canAccess: false,
      isAdmin: false,
    });
    expect(anamnesisAccess({ type: "SUPER_ADMIN", professional })).toEqual({
      canAccess: true,
      isAdmin: false,
    });
  });
});
