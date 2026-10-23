import { describe, expect, it } from "vitest";
import { normalizeText } from "@/utils/text";

describe("normalizeText", () => {
  it("tira acentos e passa para minúsculas", () => {
    expect(normalizeText("São Paulo")).toBe("sao paulo");
    expect(normalizeText("ÇÃO Ênfase")).toBe("cao enfase");
  });

  it("não muda o que já está normalizado", () => {
    expect(normalizeText("maria")).toBe("maria");
  });

  it("aceita texto vazio", () => {
    expect(normalizeText("")).toBe("");
  });
});
