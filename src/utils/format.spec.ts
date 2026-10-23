import { describe, expect, it } from "vitest";
import {
  addressTypeLabels,
  contactTypeLabels,
  documentLabel,
  formatCnpj,
  formatCpf,
  formatDateOnly,
  formatDocument,
  formatDuration,
  formatPhone,
  formatPrice,
  formatUserType,
  getInitials,
} from "@/utils/format";

// O Intl usa espaço sem quebra entre "R$" e o valor; nos testes, espaço comum.
const plain = (text: string) => text.replace(/\s/g, " ");

describe("formatCpf", () => {
  it("coloca a máscara do CPF", () => {
    expect(formatCpf("12345678909")).toBe("123.456.789-09");
  });

  it("não mexe no que não tem 11 dígitos", () => {
    expect(formatCpf("1234")).toBe("1234");
  });
});

describe("formatCnpj", () => {
  it("coloca a máscara do CNPJ numérico", () => {
    expect(formatCnpj("12345678000190")).toBe("12.345.678/0001-90");
  });

  it("aceita o CNPJ alfanumérico (letras nas 12 primeiras posições)", () => {
    expect(formatCnpj("12ABC34501DE35")).toBe("12.ABC.345/01DE-35");
  });

  it("não mexe no que não tem 14 caracteres", () => {
    expect(formatCnpj("123")).toBe("123");
  });
});

describe("documentLabel", () => {
  it("diz CPF para 11 dígitos e CNPJ para 14 caracteres", () => {
    expect(documentLabel("12345678909")).toBe("CPF");
    expect(documentLabel("12345678000190")).toBe("CNPJ");
    expect(documentLabel("12ABC34501DE35")).toBe("CNPJ");
  });
});

describe("formatDocument", () => {
  it("formata o CPF de uma empresa sem CNPJ", () => {
    expect(formatDocument("12345678909")).toBe("123.456.789-09");
  });

  it("formata o CNPJ, numérico ou alfanumérico", () => {
    expect(formatDocument("12345678000190")).toBe("12.345.678/0001-90");
    expect(formatDocument("12ABC34501DE35")).toBe("12.ABC.345/01DE-35");
  });

  it("devolve como veio um documento de tamanho inesperado", () => {
    expect(formatDocument("123")).toBe("123");
  });
});

describe("formatPhone", () => {
  it("celular e fixo", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatPhone("1133224455")).toBe("(11) 3322-4455");
  });

  it("não mexe no que não tem 10 ou 11 dígitos", () => {
    expect(formatPhone("1234")).toBe("1234");
  });
});

describe("formatDateOnly", () => {
  it("mostra o dia da data, sem deslocar pelo fuso", () => {
    expect(formatDateOnly("1990-03-15T00:00:00.000Z")).toBe("15/03/1990");
    expect(formatDateOnly("2026-10-14")).toBe("14/10/2026");
  });
});

describe("getInitials", () => {
  it("primeira e última letras do nome, em maiúsculas", () => {
    expect(getInitials("Lucas Andrade")).toBe("LA");
    expect(getInitials("maria de souza lima")).toBe("ML");
  });

  it("um nome só tem uma inicial", () => {
    expect(getInitials("Hugo")).toBe("H");
  });

  it("ignora espaços sobrando e aceita vazio", () => {
    expect(getInitials("  Ana   Paula  ")).toBe("AP");
    expect(getInitials("")).toBe("");
  });
});

describe("formatUserType", () => {
  it("traduz os tipos de usuário", () => {
    expect(formatUserType("SUPER_ADMIN")).toBe("Super administrador");
    expect(formatUserType("ADMIN")).toBe("Administrador");
    expect(formatUserType("USER")).toBe("Usuário");
  });
});

describe("rótulos de contato e endereço", () => {
  it("têm os mesmos tipos, na ordem dos selects", () => {
    expect(Object.keys(contactTypeLabels)).toEqual([
      "MAIN",
      "MESSAGE",
      "BRANCH",
    ]);
    expect(addressTypeLabels).toEqual(contactTypeLabels);
  });
});

describe("formatPrice", () => {
  it("formata em reais", () => {
    expect(plain(formatPrice("50.00"))).toBe("R$ 50,00");
    expect(plain(formatPrice(1234.5))).toBe("R$ 1.234,50");
    expect(plain(formatPrice("0"))).toBe("R$ 0,00");
  });

  it("arredonda para centavos", () => {
    expect(plain(formatPrice("10.005"))).toMatch(/^R\$ 10,0[01]$/);
  });
});

describe("formatDuration", () => {
  it("singular e plural", () => {
    expect(formatDuration(1)).toBe("1 minuto");
    expect(formatDuration(60)).toBe("60 minutos");
    expect(formatDuration(0)).toBe("0 minutos");
  });
});
