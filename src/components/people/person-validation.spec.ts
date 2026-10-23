import { describe, expect, it } from "vitest";
import {
  personFieldOrder,
  validatePersonForm,
  type PersonFormValues,
} from "@/components/people/person-validation";

const valid = (
  overrides: Partial<PersonFormValues> = {},
): PersonFormValues => ({
  name: "Maria Souza",
  phone: "(11) 98765-4321",
  email: "",
  document: "",
  ...overrides,
});

describe("validatePersonForm", () => {
  it("nome e telefone bastam; e-mail e CPF são opcionais", () => {
    expect(validatePersonForm(valid())).toEqual({});
  });

  it("o nome é obrigatório", () => {
    expect(validatePersonForm(valid({ name: "  " })).name).toBe(
      "Informe o nome.",
    );
  });

  describe("telefone", () => {
    it("é obrigatório", () => {
      expect(validatePersonForm(valid({ phone: "" })).phone).toBe(
        "Informe um contato.",
      );
      expect(validatePersonForm(valid({ phone: "(  )  -" })).phone).toBe(
        "Informe um contato.",
      );
    });

    it("precisa de DDD: pelo menos 10 dígitos", () => {
      expect(validatePersonForm(valid({ phone: "98765-4321" })).phone).toBe(
        "Informe um telefone válido, com DDD.",
      );
      expect(
        validatePersonForm(valid({ phone: "1133224455" })).phone,
      ).toBeUndefined();
      expect(
        validatePersonForm(valid({ phone: "11987654321" })).phone,
      ).toBeUndefined();
    });

    it("aceita com ou sem máscara", () => {
      expect(
        validatePersonForm(valid({ phone: "(11) 3322-4455" })).phone,
      ).toBeUndefined();
    });
  });

  describe("e-mail (só quando preenchido)", () => {
    it("aceita um formato comum", () => {
      expect(
        validatePersonForm(valid({ email: "maria@exemplo.com" })).email,
      ).toBeUndefined();
    });

    it("recusa formatos inválidos", () => {
      for (const email of ["maria", "maria@", "@exemplo.com", "a b@c.com"]) {
        expect(validatePersonForm(valid({ email })).email).toBe(
          "Informe um e-mail válido, como nome@exemplo.com.",
        );
      }
    });

    it("espaços em volta são ignorados", () => {
      expect(
        validatePersonForm(valid({ email: "  maria@exemplo.com  " })).email,
      ).toBeUndefined();
    });
  });

  describe("CPF (só quando preenchido)", () => {
    it("pede os 11 dígitos, com ou sem máscara", () => {
      expect(
        validatePersonForm(valid({ document: "123.456.789-09" })).document,
      ).toBeUndefined();
      expect(
        validatePersonForm(valid({ document: "12345678909" })).document,
      ).toBeUndefined();
      expect(
        validatePersonForm(valid({ document: "123456789" })).document,
      ).toBe("Informe os 11 dígitos do CPF.");
    });

    it("confere só o tamanho: os dígitos verificadores são conferidos pela API", () => {
      expect(
        validatePersonForm(valid({ document: "11111111111" })).document,
      ).toBeUndefined();
    });
  });

  it("a ordem dos campos é a da tela", () => {
    expect(personFieldOrder).toEqual(["name", "phone", "email", "document"]);
  });
});
