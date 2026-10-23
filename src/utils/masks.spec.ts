import { describe, expect, it } from "vitest";
import {
  maskCep,
  maskCpf,
  maskCurrency,
  maskMinutes,
  maskPhone,
  onlyDigits,
} from "@/utils/masks";

describe("onlyDigits", () => {
  it("deixa só os números", () => {
    expect(onlyDigits("(11) 98765-4321")).toBe("11987654321");
    expect(onlyDigits("abc")).toBe("");
    expect(onlyDigits("")).toBe("");
  });
});

describe("maskPhone", () => {
  it("monta a máscara enquanto o usuário digita", () => {
    expect(maskPhone("")).toBe("");
    expect(maskPhone("1")).toBe("(1");
    expect(maskPhone("11")).toBe("(11");
    expect(maskPhone("119")).toBe("(11) 9");
    expect(maskPhone("1198765")).toBe("(11) 9876-5");
  });

  it("fixo tem 8 dígitos depois do DDD; celular, 9", () => {
    expect(maskPhone("1133224455")).toBe("(11) 3322-4455");
    expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("limita a 11 dígitos e ignora o que não é número", () => {
    expect(maskPhone("1198765432199999")).toBe("(11) 98765-4321");
    expect(maskPhone("(11) abc 98765-4321")).toBe("(11) 98765-4321");
  });

  it("aplicar a máscara de novo não muda nada", () => {
    expect(maskPhone(maskPhone("11987654321"))).toBe("(11) 98765-4321");
    expect(maskPhone(maskPhone("1133224455"))).toBe("(11) 3322-4455");
  });
});

describe("maskCpf", () => {
  it("monta a máscara enquanto o usuário digita", () => {
    expect(maskCpf("123")).toBe("123");
    expect(maskCpf("1234")).toBe("123.4");
    expect(maskCpf("1234567")).toBe("123.456.7");
    expect(maskCpf("12345678909")).toBe("123.456.789-09");
  });

  it("limita a 11 dígitos", () => {
    expect(maskCpf("123456789091234")).toBe("123.456.789-09");
  });

  it("aplicar a máscara de novo não muda nada", () => {
    expect(maskCpf(maskCpf("12345678909"))).toBe("123.456.789-09");
  });
});

describe("maskCep", () => {
  it("coloca o hífen depois do quinto dígito", () => {
    expect(maskCep("175")).toBe("175");
    expect(maskCep("175000")).toBe("17500-0");
    expect(maskCep("17500000")).toBe("17500-000");
    expect(maskCep("175000001234")).toBe("17500-000");
  });
});

describe("maskCurrency", () => {
  it("interpreta os dígitos como centavos", () => {
    expect(maskCurrency("5")).toBe("R$ 0,05");
    expect(maskCurrency("50")).toBe("R$ 0,50");
    expect(maskCurrency("5000")).toBe("R$ 50,00");
    expect(maskCurrency("123456")).toBe("R$ 1.234,56");
  });

  it("vazio ou zero fica vazio", () => {
    expect(maskCurrency("")).toBe("");
    expect(maskCurrency("0")).toBe("");
    expect(maskCurrency("000")).toBe("");
  });

  it("ignora zeros à esquerda", () => {
    expect(maskCurrency("00123")).toBe("R$ 1,23");
  });

  it("limita a 10 dígitos: o campo do banco é Decimal(10,2)", () => {
    expect(maskCurrency("99999999999")).toBe("R$ 99.999.999,99");
  });

  it("aplicar a máscara de novo não muda nada", () => {
    expect(maskCurrency(maskCurrency("123456"))).toBe("R$ 1.234,56");
  });
});

describe("maskMinutes", () => {
  it("só números, até 4 dígitos, sem zeros à esquerda", () => {
    expect(maskMinutes("0030")).toBe("30");
    expect(maskMinutes("12345")).toBe("1234");
    expect(maskMinutes("abc")).toBe("");
    expect(maskMinutes("60")).toBe("60");
  });
});
