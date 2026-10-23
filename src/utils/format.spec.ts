import { describe, expect, it } from "vitest";
import {
  documentLabel,
  formatCnpj,
  formatCpf,
  formatDocument,
} from "@/utils/format";

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
