import { describe, expect, it } from "vitest";
import {
  buildNewAnswers,
  changedAnswers,
  draftFromValue,
  emptyDraft,
  parseAnswer,
} from "@/components/anamnesis/records/answer-form";

const base = { options: [] as string[], detailLabel: null as string | null };

describe("parseAnswer", () => {
  it("campo vazio é omitido em qualquer tipo", () => {
    for (const type of [
      "SHORT_TEXT",
      "LONG_TEXT",
      "YES_NO",
      "SINGLE_CHOICE",
      "MULTIPLE_CHOICE",
      "NUMBER",
      "DATE",
      "SCALE",
    ] as const) {
      expect(parseAnswer({ ...base, type }, emptyDraft())).toEqual({
        kind: "empty",
      });
    }
  });

  it("monta o sim ou não, com detalhe só se a pergunta o pede", () => {
    const draft = {
      ...emptyDraft(),
      yesNo: "yes" as const,
      detail: " Dipirona ",
    };
    expect(
      parseAnswer({ ...base, type: "YES_NO", detailLabel: "Qual?" }, draft),
    ).toEqual({ kind: "value", value: { answer: true, detail: "Dipirona" } });
    expect(parseAnswer({ ...base, type: "YES_NO" }, draft)).toEqual({
      kind: "value",
      value: { answer: true },
    });
    expect(
      parseAnswer(
        { ...base, type: "YES_NO", detailLabel: "Qual?" },
        { ...draft, yesNo: "no" },
      ),
    ).toEqual({ kind: "value", value: { answer: false } });
  });

  it("converte número (aceita vírgula) e rejeita texto", () => {
    const q = { ...base, type: "NUMBER" as const };
    expect(parseAnswer(q, { ...emptyDraft(), text: "68,5" })).toEqual({
      kind: "value",
      value: 68.5,
    });
    expect(parseAnswer(q, { ...emptyDraft(), text: "abc" }).kind).toBe("error");
  });

  it("confere a escala de 0 a 10 inteira", () => {
    const q = { ...base, type: "SCALE" as const };
    expect(parseAnswer(q, { ...emptyDraft(), text: "0" })).toEqual({
      kind: "value",
      value: 0,
    });
    expect(parseAnswer(q, { ...emptyDraft(), text: "11" }).kind).toBe("error");
    expect(parseAnswer(q, { ...emptyDraft(), text: "2.5" }).kind).toBe("error");
  });

  it("escolha múltipla segue a ordem das opções", () => {
    const q = {
      ...base,
      type: "MULTIPLE_CHOICE" as const,
      options: ["Corrida", "Natação", "Yoga"],
    };
    expect(
      parseAnswer(q, { ...emptyDraft(), choices: ["Yoga", "Corrida"] }),
    ).toEqual({ kind: "value", value: ["Corrida", "Yoga"] });
  });

  it("valida data e texto longo demais", () => {
    expect(
      parseAnswer(
        { ...base, type: "DATE" },
        { ...emptyDraft(), text: "2026-13-40" },
      ).kind,
    ).toBe("error");
    expect(
      parseAnswer(
        { ...base, type: "LONG_TEXT" },
        { ...emptyDraft(), text: "a".repeat(5001) },
      ).kind,
    ).toBe("error");
  });
});

describe("draftFromValue", () => {
  it("volta o valor da API para o campo da tela", () => {
    expect(
      draftFromValue({ type: "YES_NO" }, { answer: true, detail: "X" }),
    ).toMatchObject({ yesNo: "yes", detail: "X" });
    expect(draftFromValue({ type: "SCALE" }, 7).text).toBe("7");
    expect(
      draftFromValue({ type: "MULTIPLE_CHOICE" }, ["A", "B"]).choices,
    ).toEqual(["A", "B"]);
  });
});

describe("changedAnswers", () => {
  const questions = [
    { id: "q1", type: "SHORT_TEXT" as const, options: [], detailLabel: null },
    { id: "q2", type: "SCALE" as const, options: [], detailLabel: null },
    { id: "q3", type: "SHORT_TEXT" as const, options: [], detailLabel: null },
  ];
  const current = { q1: "Dor lombar", q2: 7 };

  it("envia só o que mudou", () => {
    const drafts = {
      q1: draftFromValue(questions[0], "Dor lombar"),
      q2: { ...emptyDraft(), text: "2" },
      q3: emptyDraft(),
    };
    expect(changedAnswers(questions, drafts, current)).toEqual({
      answers: [{ questionId: "q2", value: 2 }],
      errors: {},
    });
  });

  it("não envia nada quando nada mudou nem apaga resposta dada", () => {
    const drafts = {
      q1: emptyDraft(), // esvaziada: a API não apaga, então não vai
      q2: draftFromValue(questions[1], 7),
      q3: emptyDraft(),
    };
    expect(changedAnswers(questions, drafts, current).answers).toEqual([]);
  });

  it("devolve o erro da pergunta inválida", () => {
    const drafts = { q2: { ...emptyDraft(), text: "99" } };
    expect(changedAnswers(questions, drafts, current).errors.q2).toBeTruthy();
  });

  it("compara sim ou não e listas pelo conteúdo", () => {
    const q = [
      { id: "a", type: "YES_NO" as const, options: [], detailLabel: "Qual?" },
      {
        id: "b",
        type: "MULTIPLE_CHOICE" as const,
        options: ["X", "Y"],
        detailLabel: null,
      },
    ];
    const cur = { a: { detail: "Dipirona", answer: true }, b: ["X", "Y"] };
    const drafts = {
      a: draftFromValue(q[0], cur.a),
      b: draftFromValue(q[1], cur.b),
    };
    expect(changedAnswers(q, drafts, cur).answers).toEqual([]);
  });
});

describe("buildNewAnswers", () => {
  const questions = [
    {
      id: "a",
      type: "SHORT_TEXT" as const,
      options: [],
      detailLabel: null,
      isRequired: true,
    },
    {
      id: "b",
      type: "SCALE" as const,
      options: [],
      detailLabel: null,
      isRequired: false,
    },
    {
      id: "c",
      type: "NUMBER" as const,
      options: [],
      detailLabel: null,
      isRequired: false,
    },
  ];

  it("envia as respondidas e omite a opcional vazia", () => {
    const drafts = {
      a: { ...emptyDraft(), text: "Dor lombar" },
      b: emptyDraft(),
      c: { ...emptyDraft(), text: "68,5" },
    };
    expect(buildNewAnswers(questions, drafts)).toEqual({
      answers: [
        { questionId: "a", value: "Dor lombar" },
        { questionId: "c", value: 68.5 },
      ],
      errors: {},
    });
  });

  it("pergunta obrigatória vazia é erro", () => {
    const result = buildNewAnswers(questions, {});
    expect(result.errors.a).toMatch(/obrigatória/);
    expect(result.errors.b).toBeUndefined();
    expect(result.answers).toEqual([]);
  });

  it("valor inválido é erro da pergunta", () => {
    const drafts = {
      a: { ...emptyDraft(), text: "ok" },
      c: { ...emptyDraft(), text: "abc" },
    };
    expect(buildNewAnswers(questions, drafts).errors.c).toBeTruthy();
  });
});
