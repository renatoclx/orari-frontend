import { describe, expect, it } from "vitest";
import {
  COMPANY_TIMEZONES,
  DEFAULT_TIMEZONE,
  timezoneOptions,
} from "@/components/companies/company-timezones";
import {
  MAX_FANTASY_NAME,
  companyFieldOrder,
  documentKind,
  validateCompanyForm,
  type CompanyFormValues,
} from "@/components/companies/company-validation";

const valid = (
  overrides: Partial<CompanyFormValues> = {},
): CompanyFormValues => ({
  corporateReason: "Clínica Sol LTDA",
  fantasyName: "Clínica Sol",
  document: "11.222.333/0001-81",
  foundationDate: "2020-05-10",
  subdomain: "clinica-sol",
  timezone: DEFAULT_TIMEZONE,
  ...overrides,
});

describe("validateCompanyForm", () => {
  it("uma empresa com CNPJ completo não tem erros", () => {
    expect(validateCompanyForm(valid())).toEqual({});
  });

  it("uma pessoa com CPF, sem nome fantasia nem data de fundação, é válida", () => {
    expect(
      validateCompanyForm(
        valid({
          corporateReason: "Maria Souza",
          fantasyName: "",
          document: "529.982.247-25",
          foundationDate: "",
        }),
      ),
    ).toEqual({});
  });

  it("a razão social é obrigatória", () => {
    expect(
      validateCompanyForm(valid({ corporateReason: "   " })).corporateReason,
    ).toMatch(/Informe a razão social/);
  });

  describe("nome fantasia", () => {
    it("é opcional e vai até 100 caracteres", () => {
      const fantasyName = (value: string) =>
        validateCompanyForm(valid({ fantasyName: value })).fantasyName;

      expect(fantasyName("")).toBeUndefined();
      expect(fantasyName("a".repeat(MAX_FANTASY_NAME))).toBeUndefined();
      expect(fantasyName("a".repeat(MAX_FANTASY_NAME + 1))).toMatch(/até 100/);
    });
  });

  describe("documento", () => {
    const document = (value: string) =>
      validateCompanyForm(valid({ document: value })).document;

    it("é obrigatório", () => {
      expect(document("")).toBe("Informe o CPF ou o CNPJ.");
      expect(document("..-")).toBe("Informe o CPF ou o CNPJ.");
    });

    it("aceita CPF e CNPJ, com ou sem máscara", () => {
      expect(document("52998224725")).toBeUndefined();
      expect(document("529.982.247-25")).toBeUndefined();
      expect(document("11222333000181")).toBeUndefined();
      expect(document("11.222.333/0001-81")).toBeUndefined();
    });

    it("aceita o CNPJ alfanumérico, inclusive em minúsculas", () => {
      expect(document("12ABC34501DE35")).toBeUndefined();
      expect(document("12.abc.345/01de-35")).toBeUndefined();
    });

    it("confere os dígitos verificadores", () => {
      expect(document("52998224726")).toBe("CPF inválido.");
      expect(document("11222333000182")).toBe("CNPJ inválido.");
      expect(document("11111111111")).toBe("CPF inválido.");
    });

    it("recusa tamanho que não é de CPF nem de CNPJ", () => {
      expect(document("123456789")).toBe(
        "Informe um CPF (11 dígitos) ou um CNPJ (14 caracteres).",
      );
      expect(document("123456789012345")).toBe(
        "Informe um CPF (11 dígitos) ou um CNPJ (14 caracteres).",
      );
    });
  });

  describe("data de fundação", () => {
    it("é opcional; se vier, precisa ser uma data de calendário", () => {
      const date = (value: string) =>
        validateCompanyForm(valid({ foundationDate: value })).foundationDate;

      expect(date("")).toBeUndefined();
      expect(date("2020-05-10")).toBeUndefined();
      expect(date("2020-02-30")).toBe("Informe uma data válida.");
      expect(date("10/05/2020")).toBe("Informe uma data válida.");
    });
  });

  describe("subdomínio", () => {
    const subdomain = (value: string) =>
      validateCompanyForm(valid({ subdomain: value })).subdomain;

    it("é obrigatório", () => {
      expect(subdomain("")).toBe("Informe o subdomínio.");
    });

    it("só letras minúsculas, números e hífens, sem hífen nas pontas", () => {
      for (const ok of ["clinica", "clinica-sol", "a1-b2-c3", "123"]) {
        expect(subdomain(ok)).toBeUndefined();
      }
      for (const bad of [
        "Clinica",
        "clinica sol",
        "clinica_sol",
        "-clinica",
        "clinica-",
        "clinica--sol",
        "clínica",
        "clinica.sol",
      ]) {
        expect(subdomain(bad)).toMatch(/letras minúsculas, números e hífens/);
      }
    });
  });

  it("o fuso é obrigatório", () => {
    expect(validateCompanyForm(valid({ timezone: "" })).timezone).toBe(
      "Selecione o fuso horário.",
    );
  });

  it("junta os erros de vários campos, na ordem da tela", () => {
    const errors = validateCompanyForm({
      corporateReason: "",
      fantasyName: "a".repeat(101),
      document: "",
      foundationDate: "x",
      subdomain: "",
      timezone: "",
    });

    expect(Object.keys(errors)).toEqual(companyFieldOrder);
  });
});

describe("documentKind", () => {
  it("o tamanho diz se é CPF ou CNPJ", () => {
    expect(documentKind("529.982.247-25")).toBe("CPF");
    expect(documentKind("11222333000181")).toBe("CNPJ");
    expect(documentKind("12.ABC.345/01DE-35")).toBe("CNPJ");
    expect(documentKind("")).toBeNull();
    expect(documentKind("12345")).toBeNull();
  });
});

describe("fusos da empresa", () => {
  it("o padrão é Brasília e está na lista", () => {
    expect(DEFAULT_TIMEZONE).toBe("America/Sao_Paulo");
    expect(COMPANY_TIMEZONES[0].value).toBe(DEFAULT_TIMEZONE);
  });

  it("um fuso de fora da lista continua selecionável na alteração", () => {
    expect(timezoneOptions().length).toBe(COMPANY_TIMEZONES.length);
    expect(timezoneOptions("America/Manaus").length).toBe(
      COMPANY_TIMEZONES.length,
    );
    const extra = timezoneOptions("Europe/Lisbon");
    expect(extra.length).toBe(COMPANY_TIMEZONES.length + 1);
    expect(extra.at(-1)).toEqual({
      value: "Europe/Lisbon",
      label: "Europe/Lisbon",
    });
  });

  it("os fusos são únicos", () => {
    const values = COMPANY_TIMEZONES.map((zone) => zone.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
