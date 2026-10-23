import { describe, expect, it } from "vitest";
import {
  userFieldOrder,
  validatePassword,
  validateUpdateUserForm,
  validateUserForm,
  type UserFormValues,
} from "@/components/users/user-validation";

const valid = (overrides: Partial<UserFormValues> = {}): UserFormValues => ({
  name: "Ana Lima",
  email: "ana@empresa.com",
  type: "USER",
  password: "senha1234",
  passwordConfirmation: "senha1234",
  ...overrides,
});

describe("validatePassword", () => {
  it("aceita senha de 8 caracteres ou mais, confirmada", () => {
    expect(validatePassword("senha1234", "senha1234")).toEqual({});
    expect(validatePassword("12345678", "12345678")).toEqual({});
  });

  it("a senha é obrigatória e tem no mínimo 8 caracteres", () => {
    expect(validatePassword("", "").password).toBe("Informe a senha.");
    expect(validatePassword("1234567", "1234567").password).toBe(
      "A senha deve ter pelo menos 8 caracteres.",
    );
  });

  it("o limite é de 72 bytes: letra acentuada ocupa 2", () => {
    expect(validatePassword("a".repeat(72), "a".repeat(72)).password).toBe(
      undefined,
    );
    expect(validatePassword("a".repeat(73), "a".repeat(73)).password).toMatch(
      /longa demais/,
    );
    // 37 letras acentuadas = 74 bytes, embora só tenham 37 caracteres.
    const accented = "é".repeat(37);
    expect(validatePassword(accented, accented).password).toMatch(
      /longa demais/,
    );
  });

  it("a confirmação é obrigatória e precisa ser igual", () => {
    expect(validatePassword("senha1234", "").passwordConfirmation).toBe(
      "Confirme a senha.",
    );
    expect(
      validatePassword("senha1234", "senha12345").passwordConfirmation,
    ).toBe("As senhas não conferem.");
  });

  it("espaços fazem parte da senha (não há trim)", () => {
    expect(validatePassword("  senha  ", "  senha  ")).toEqual({});
    expect(
      validatePassword("senha1234 ", "senha1234").passwordConfirmation,
    ).toBe("As senhas não conferem.");
  });
});

describe("validateUserForm (cadastro)", () => {
  it("um cadastro completo não tem erros", () => {
    expect(validateUserForm(valid())).toEqual({});
  });

  it("nome e e-mail são obrigatórios", () => {
    const errors = validateUserForm(valid({ name: " ", email: "" }));

    expect(errors.name).toBe("Informe o nome do usuário.");
    expect(errors.email).toBe("Informe o e-mail do usuário.");
  });

  it("o e-mail precisa ter formato válido", () => {
    expect(validateUserForm(valid({ email: "ana@" })).email).toBe(
      "Informe um e-mail válido.",
    );
    expect(
      validateUserForm(valid({ email: "  ana@empresa.com " })).email,
    ).toBeUndefined();
  });

  it("o tipo é obrigatório e precisa existir", () => {
    expect(validateUserForm(valid({ type: "" })).type).toBe(
      "Selecione o tipo do usuário.",
    );
    expect(validateUserForm(valid({ type: "ROOT" })).type).toBe(
      "Tipo de usuário inválido.",
    );
    for (const type of ["SUPER_ADMIN", "ADMIN", "USER"]) {
      expect(validateUserForm(valid({ type })).type).toBeUndefined();
    }
  });

  it("inclui os erros da senha", () => {
    const errors = validateUserForm(valid({ password: "123" }));

    expect(errors.password).toBeDefined();
    expect(errors.passwordConfirmation).toBe("As senhas não conferem.");
  });

  it("a ordem dos campos é a da tela", () => {
    expect(userFieldOrder).toEqual([
      "name",
      "email",
      "type",
      "password",
      "passwordConfirmation",
    ]);
  });
});

describe("validateUpdateUserForm (alteração)", () => {
  it("não exige senha: ela tem rota própria", () => {
    expect(
      validateUpdateUserForm({
        name: "Ana",
        email: "ana@empresa.com",
        type: "ADMIN",
      }),
    ).toEqual({});
  });

  it("confere nome, e-mail e tipo", () => {
    const errors = validateUpdateUserForm({ name: "", email: "x", type: "" });

    expect(Object.keys(errors).sort()).toEqual(["email", "name", "type"]);
  });
});
