import { describe, expect, it } from "vitest";
import {
  orNull,
  profileErrors,
  type ProfileFields,
} from "@/components/client-app/profile";

const fields = (overrides: Partial<ProfileFields> = {}): ProfileFields => ({
  name: "Ana Souza",
  phone: "(31) 98888-7777",
  email: "",
  document: "",
  birthDate: "",
  profession: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  cityName: "",
  cityState: "",
  ...overrides,
});

describe("profileErrors", () => {
  it("só nome e telefone: válido", () => {
    expect(profileErrors(fields(), "2026-11-05")).toEqual({});
  });

  it("e-mail, CPF e nascimento no futuro", () => {
    expect(
      profileErrors(
        fields({
          email: "ana@",
          document: "111.111.111-11",
          birthDate: "2027-01-01",
        }),
        "2026-11-05",
      ),
    ).toEqual({
      email: "Informe um e-mail válido.",
      document: "Informe um CPF válido.",
      birthDate: "A data de nascimento não pode ser no futuro.",
    });
  });

  it("CPF válido com máscara: aceito", () => {
    expect(
      profileErrors(fields({ document: "529.982.247-25" }), "2026-11-05"),
    ).toEqual({});
  });

  it("endereço começado: pede a cidade pelo CEP, a rua e o número", () => {
    expect(profileErrors(fields({ cep: "30130-010" }), "2026-11-05")).toEqual({
      cep: "Busque o CEP para preencher a cidade.",
      street: "Informe a rua.",
      number: "Informe o número.",
    });
    expect(profileErrors(fields({ cep: "3013" }), "2026-11-05").cep).toBe(
      "Informe o CEP com 8 dígitos.",
    );
  });
});

describe("orNull", () => {
  it("vazio vira null; o resto, sem espaços nas pontas", () => {
    expect(orNull("  ")).toBeNull();
    expect(orNull(" Designer ")).toBe("Designer");
  });
});
