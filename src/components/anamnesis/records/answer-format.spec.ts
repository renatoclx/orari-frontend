import { describe, expect, it } from "vitest";
import { formatAnswer } from "@/components/anamnesis/records/answer-format";

describe("formatAnswer", () => {
  it("formata sim ou não, com e sem detalhe", () => {
    const q = { type: "YES_NO" } as const;
    expect(formatAnswer(q, { answer: true, detail: "Dipirona" })).toBe(
      "Sim: Dipirona",
    );
    expect(formatAnswer(q, { answer: true })).toBe("Sim");
    expect(formatAnswer(q, { answer: false })).toBe("Não");
  });

  it("junta as escolhas múltiplas", () => {
    expect(
      formatAnswer({ type: "MULTIPLE_CHOICE" }, ["Corrida", "Natação"]),
    ).toBe("Corrida, Natação");
  });

  it("mostra a data pura sem voltar um dia", () => {
    expect(formatAnswer({ type: "DATE" }, "2019-03-14")).toBe("14/03/2019");
  });

  it("mostra a escala e o número", () => {
    expect(formatAnswer({ type: "SCALE" }, 7)).toBe("7 de 10");
    expect(formatAnswer({ type: "SCALE" }, 0)).toBe("0 de 10");
    expect(formatAnswer({ type: "NUMBER" }, 68.5)).toBe("68,5");
  });

  it("mostra o texto como veio", () => {
    expect(formatAnswer({ type: "LONG_TEXT" }, "Dor lombar")).toBe(
      "Dor lombar",
    );
    expect(formatAnswer({ type: "SINGLE_CHOICE" }, "Casado(a)")).toBe(
      "Casado(a)",
    );
  });

  it("devolve null para formato inesperado, sem expor o valor", () => {
    expect(formatAnswer({ type: "SCALE" }, "7")).toBeNull();
    expect(formatAnswer({ type: "YES_NO" }, "sim")).toBeNull();
    expect(formatAnswer({ type: "MULTIPLE_CHOICE" }, [])).toBeNull();
    expect(formatAnswer({ type: "DATE" }, "14/03/2019")).toBeNull();
    expect(formatAnswer({ type: "SHORT_TEXT" }, null)).toBeNull();
  });
});
