import { describe, expect, it } from "vitest";
import {
  planFromQuery,
  toSignupInput,
  validateSignup,
  type SignupValues,
} from "@/components/auth/signup-validation";

const valid: SignupValues = {
  companyName: "Studio Aurora",
  document: "11.444.777/0001-61",
  name: "Marina Alves",
  email: "Marina@Aurora.com ",
  phone: "(11) 99999-8888",
  password: "Senha#2026",
  passwordConfirmation: "Senha#2026",
  plan: "PLUS",
  acceptTerms: true,
};

describe("cadastro sozinho", () => {
  it("plano da landing; sem ele, o Plus", () => {
    expect(planFromQuery("essencial")).toBe("ESSENTIAL");
    expect(planFromQuery("clinical")).toBe("CLINICAL");
    expect(planFromQuery(undefined)).toBe("PLUS");
    expect(planFromQuery("qualquer")).toBe("PLUS");
  });

  it("formulário válido não tem erros", () => {
    expect(validateSignup(valid)).toEqual({});
  });

  it("aponta cada campo inválido, inclusive o aceite", () => {
    const errors = validateSignup({
      ...valid,
      companyName: " ",
      document: "11.444.777/0001-00",
      email: "marina",
      phone: "9999",
      password: "curta",
      acceptTerms: false,
    });
    expect(Object.keys(errors).sort()).toEqual([
      "acceptTerms",
      "companyName",
      "document",
      "email",
      "password",
      // A senha mudou e a confirmação não: também acusa.
      "passwordConfirmation",
      "phone",
    ]);
  });

  it("a confirmação precisa repetir a senha", () => {
    expect(
      validateSignup({ ...valid, passwordConfirmation: "" })
        .passwordConfirmation,
    ).toBe("Repita a senha.");
    expect(
      validateSignup({ ...valid, passwordConfirmation: "Senha#2027" })
        .passwordConfirmation,
    ).toBe("As senhas não são iguais.");
  });

  it("envia só os caracteres que valem, com o e-mail em minúsculas", () => {
    // A confirmação não vai para a API.
    expect(toSignupInput(valid)).not.toHaveProperty("passwordConfirmation");
    expect(toSignupInput(valid)).toMatchObject({
      document: "11444777000161",
      phone: "11999998888",
      email: "marina@aurora.com",
    });
  });
});
