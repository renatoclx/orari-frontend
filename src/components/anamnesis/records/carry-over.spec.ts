import { describe, expect, it } from "vitest";
import { carryOverAnswers } from "@/components/anamnesis/records/carry-over";
import type { AnamnesisDetail, TemplateQuestion } from "@/types/anamnesis";

const q = (
  id: string,
  label: string,
  type: TemplateQuestion["type"],
  options: string[] = [],
): TemplateQuestion => ({
  id,
  position: 1,
  label,
  helpText: null,
  type,
  isRequired: false,
  options,
  detailLabel: null,
});

const from = {
  version: {
    id: "v1",
    version: 1,
    responsibilityTerm: null,
    questions: [
      q("o1", "Tem alergia?", "YES_NO"),
      q("o2", "Pratica esportes?", "SHORT_TEXT"),
      q("o3", "Nível de dor", "SCALE"),
      q("o4", "Região", "SINGLE_CHOICE", ["Costas", "Joelho"]),
      q("o5", "Objetivos", "MULTIPLE_CHOICE", ["Força", "Postura", "Dor"]),
    ],
  },
  current: [
    { questionId: "o1", value: { answer: true, detail: "Dipirona" } },
    { questionId: "o2", value: "Corrida" },
    // Atualizada num acompanhamento: é a que vale.
    { questionId: "o3", value: 3 },
    { questionId: "o4", value: "Joelho" },
    { questionId: "o5", value: ["Força", "Dor"] },
  ],
} as unknown as Pick<AnamnesisDetail, "version" | "current">;

describe("carryOverAnswers", () => {
  it("leva a resposta mais recente para a mesma pergunta da versão nova, pelo texto e tipo", () => {
    const drafts = carryOverAnswers(from, [
      q("n1", "tem ALERGIA?", "YES_NO"),
      q("n3", "Nível de dor", "SCALE"),
    ]);

    expect(drafts.n1).toMatchObject({ yesNo: "yes", detail: "Dipirona" });
    expect(drafts.n3).toMatchObject({ text: "3" });
  });

  it("pergunta nova, com texto mudado ou de outro tipo fica em branco", () => {
    const drafts = carryOverAnswers(from, [
      q("n2", "Pratica esportes?", "LONG_TEXT"),
      q("n6", "Usa medicamento?", "YES_NO"),
    ]);

    expect(drafts).toEqual({});
  });

  it("nas escolhas, descarta as opções que deixaram de existir", () => {
    const drafts = carryOverAnswers(from, [
      q("n4", "Região", "SINGLE_CHOICE", ["Costas", "Quadril"]),
      q("n5", "Objetivos", "MULTIPLE_CHOICE", ["Força", "Postura"]),
    ]);

    expect(drafts.n4).toBeUndefined();
    expect(drafts.n5.choices).toEqual(["Força"]);
  });
});
