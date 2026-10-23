import { describe, expect, it } from "vitest";
import { isValidCnpj, isValidCpf, normalizeDocument } from "@/utils/document";

describe("normalizeDocument", () => {
  it("tira a máscara e passa para maiúsculas", () => {
    expect(normalizeDocument("529.982.247-25")).toBe("52998224725");
    expect(normalizeDocument("12.345.678/0001-95")).toBe("12345678000195");
    expect(normalizeDocument(" 12.abc.345/01de-35 ")).toBe("12ABC34501DE35");
    expect(normalizeDocument("")).toBe("");
  });
});

describe("isValidCpf", () => {
  it("aceita CPFs com dígitos verificadores corretos", () => {
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("11144477735")).toBe(true);
  });

  it("recusa dígito verificador errado", () => {
    expect(isValidCpf("52998224726")).toBe(false);
    expect(isValidCpf("52998224715")).toBe(false);
  });

  it("recusa sequências repetidas, mesmo passando no cálculo", () => {
    expect(isValidCpf("11111111111")).toBe(false);
    expect(isValidCpf("00000000000")).toBe(false);
  });

  it("recusa tamanho e formato errados", () => {
    expect(isValidCpf("")).toBe(false);
    expect(isValidCpf("5299822472")).toBe(false);
    expect(isValidCpf("529982247255")).toBe(false);
    expect(isValidCpf("5299822472a")).toBe(false);
    expect(isValidCpf("529.982.247-25")).toBe(false);
  });
});

describe("isValidCnpj", () => {
  it("aceita CNPJ numérico válido", () => {
    expect(isValidCnpj("12345678000195")).toBe(true);
    expect(isValidCnpj("11222333000181")).toBe(true);
  });

  it("aceita CNPJ alfanumérico válido", () => {
    expect(isValidCnpj("12ABC34501DE35")).toBe(true);
  });

  it("recusa dígito verificador errado", () => {
    expect(isValidCnpj("12345678000190")).toBe(false);
    expect(isValidCnpj("12ABC34501DE36")).toBe(false);
  });

  it("recusa sequências repetidas, tamanho e formato errados", () => {
    expect(isValidCnpj("11111111111111")).toBe(false);
    expect(isValidCnpj("1234567800019")).toBe(false);
    expect(isValidCnpj("123456780001955")).toBe(false);
    expect(isValidCnpj("12abc34501de35")).toBe(false);
    expect(isValidCnpj("12ABC34501DEAB")).toBe(false);
    expect(isValidCnpj("12.345.678/0001-95")).toBe(false);
  });

  it("um CPF não é CNPJ e um CNPJ não é CPF", () => {
    expect(isValidCnpj("52998224725")).toBe(false);
    expect(isValidCpf("12345678000195")).toBe(false);
  });
});
