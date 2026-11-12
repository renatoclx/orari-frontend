import { describe, expect, it } from "vitest";
import {
  dateOf,
  pageCount,
  parsePageParam,
  telUrl,
  whatsappUrl,
} from "./professional-clients";

describe("parsePageParam", () => {
  it("aceita inteiros a partir de 1 e usa 1 para o resto", () => {
    expect(parsePageParam("3")).toBe(3);
    for (const value of ["0", "-2", "1.5", "abc", undefined, ["2"]]) {
      expect(parsePageParam(value)).toBe(1);
    }
  });
});

describe("pageCount", () => {
  it("arredonda para cima e nunca é menos de 1", () => {
    expect(pageCount(0, 20)).toBe(1);
    expect(pageCount(20, 20)).toBe(1);
    expect(pageCount(21, 20)).toBe(2);
  });
});

describe("telUrl e whatsappUrl", () => {
  it("montam os links com o código do Brasil, só com dígitos", () => {
    expect(telUrl("(11) 90000-0123")).toBe("tel:+5511900000123");
    expect(whatsappUrl("11900000123")).toBe("https://wa.me/5511900000123");
    expect(whatsappUrl("1133224455")).toBe("https://wa.me/551133224455");
  });
  it("sem telefone ou sem DDD, não há link", () => {
    expect(telUrl(null)).toBeNull();
    expect(whatsappUrl("")).toBeNull();
    expect(whatsappUrl("900000123")).toBeNull();
  });
});

describe("dateOf", () => {
  it("usa o dia do relógio da clínica", () => {
    // 01:00 UTC do dia 13 ainda é dia 12 em São Paulo.
    expect(dateOf("2026-11-13T01:00:00.000Z", "America/Sao_Paulo")).toBe(
      "12/11/2026",
    );
  });
});
