import { describe, expect, it } from "vitest";
import { maskCpfOrCnpj } from "@/utils/masks";

describe("maskCpfOrCnpj", () => {
  it("CPF até 11 dígitos; CNPJ acima", () => {
    expect(maskCpfOrCnpj("12345678909")).toBe("123.456.789-09");
    expect(maskCpfOrCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(maskCpfOrCnpj("112223330001815")).toBe("11.222.333/0001-81");
  });
});
