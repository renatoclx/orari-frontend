import { describe, expect, it } from "vitest";
import {
  linkApplies,
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
  linkType: "",
  peopleId: "",
  phone: "",
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
      "peopleId",
      "phone",
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
        linkType: "",
        peopleId: "",
        phone: "",
      }),
    ).toEqual({});
  });

  it("confere nome, e-mail e tipo", () => {
    const errors = validateUpdateUserForm({
      name: "",
      email: "x",
      type: "",
      linkType: "",
      peopleId: "",
      phone: "",
    });

    expect(Object.keys(errors).sort()).toEqual(["email", "name", "type"]);
  });
});

describe("vínculo com profissional ou funcionário", () => {
  it("sem função, a pessoa não é exigida", () => {
    expect(validateUserForm(valid())).toEqual({});
  });

  it("com função, exige a pessoa escolhida", () => {
    expect(validateUserForm(valid({ linkType: "PROFESSIONAL" })).peopleId).toBe(
      "Selecione o profissional.",
    );
    expect(validateUserForm(valid({ linkType: "EMPLOYEE" })).peopleId).toBe(
      "Selecione o funcionário.",
    );
    expect(
      validateUserForm(valid({ linkType: "EMPLOYEE", peopleId: "p1" })),
    ).toEqual({});
  });

  it("vale também na alteração", () => {
    const errors = validateUpdateUserForm({
      name: "Ana",
      email: "ana@empresa.com",
      type: "USER",
      linkType: "EMPLOYEE",
      peopleId: "",
      phone: "",
    });

    expect(errors.peopleId).toBe("Selecione o funcionário.");
  });

  it("o SUPER_ADMIN não se vincula, mesmo com função escolhida", () => {
    const values = valid({ type: "SUPER_ADMIN", linkType: "PROFESSIONAL" });

    expect(linkApplies(values)).toBe(false);
    expect(validateUserForm(values)).toEqual({});
  });

  it("ADMIN e USER podem se vincular", () => {
    expect(linkApplies(valid({ linkType: "EMPLOYEE" }))).toBe(true);
    expect(
      linkApplies(valid({ type: "ADMIN", linkType: "PROFESSIONAL" })),
    ).toBe(true);
    expect(linkApplies(valid())).toBe(false);
  });
});

describe("usuário só de app (PROFESSIONAL)", () => {
  const base = {
    name: "Rafael",
    email: "rafael@clinica.com",
    password: "Senha@Forte1",
    passwordConfirmation: "Senha@Forte1",
    type: "PROFESSIONAL",
    phone: "(11) 98888-0001",
  } as const;

  it("o vínculo sempre vale, mesmo sem função escolhida", () => {
    expect(linkApplies({ type: "PROFESSIONAL", linkType: "" })).toBe(true);
    expect(linkApplies({ type: "USER", linkType: "" })).toBe(false);
  });

  it("exige um profissional: sem pessoa ou com funcionário é recusado", () => {
    expect(
      validateUserForm({ ...base, linkType: "PROFESSIONAL", peopleId: "" })
        .peopleId,
    ).toBe("Selecione o profissional.");
    expect(
      validateUserForm({ ...base, linkType: "EMPLOYEE", peopleId: "p1" })
        .peopleId,
    ).toBe("Selecione o profissional.");
    expect(
      validateUserForm({ ...base, linkType: "", peopleId: "" }).peopleId,
    ).toBe("Selecione o profissional.");
  });

  it("com o profissional escolhido, é válido (também na alteração)", () => {
    const values = {
      ...base,
      linkType: "PROFESSIONAL",
      peopleId: "p1",
    } as const;
    expect(validateUserForm(values)).toEqual({});
    expect(validateUpdateUserForm(values)).toEqual({});
  });
});

describe("telefone de acesso ao app (só no PROFESSIONAL)", () => {
  const pro = valid({
    type: "PROFESSIONAL",
    linkType: "PROFESSIONAL",
    peopleId: "p1",
  });

  it("é obrigatório no usuário só de app", () => {
    expect(validateUserForm({ ...pro, phone: "" }).phone).toBe(
      "Informe o telefone de acesso ao app.",
    );
  });

  it("aceita 10 ou 11 dígitos, com a máscara", () => {
    expect(validateUserForm({ ...pro, phone: "(11) 98888-0001" })).toEqual({});
    expect(validateUserForm({ ...pro, phone: "(11) 3888-0001" })).toEqual({});
  });

  it("recusa número curto ou longo demais", () => {
    expect(validateUserForm({ ...pro, phone: "(11) 9888" }).phone).toBe(
      "Informe o telefone com DDD (10 ou 11 dígitos).",
    );
    expect(
      validateUserForm({ ...pro, phone: "119888800012" }).phone,
    ).toBeDefined();
  });

  it("os demais tipos não pedem telefone (nem o conferem)", () => {
    expect(validateUserForm(valid({ phone: "" }))).toEqual({});
    expect(validateUserForm(valid({ phone: "abc" }))).toEqual({});
  });

  it("vale também na alteração", () => {
    expect(validateUpdateUserForm({ ...pro, phone: "" }).phone).toBeDefined();
  });

  it("o campo vem depois do vínculo e antes da senha", () => {
    expect(userFieldOrder.indexOf("phone")).toBeGreaterThan(
      userFieldOrder.indexOf("peopleId"),
    );
    expect(userFieldOrder.indexOf("phone")).toBeLessThan(
      userFieldOrder.indexOf("password"),
    );
  });
});
