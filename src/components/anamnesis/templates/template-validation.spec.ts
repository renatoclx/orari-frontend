import { describe, expect, it } from "vitest";
import {
  draftFromTemplate,
  emptyQuestion,
  hasErrors,
  questionsChanged,
  toQuestionInputs,
  validateTemplateForm,
  type QuestionDraft,
  type TemplateFormValues,
} from "@/components/anamnesis/templates/template-validation";
import type { TemplateItem } from "@/types/anamnesis";

let counter = 0;
const key = () => `k${++counter}`;

const question = (overrides: Partial<QuestionDraft> = {}): QuestionDraft => ({
  ...emptyQuestion(key()),
  label: "Tem alergia?",
  ...overrides,
});
const options = (...texts: string[]) =>
  texts.map((text) => ({ key: key(), text }));

const form = (
  overrides: Partial<TemplateFormValues> = {},
): TemplateFormValues => ({
  name: "Fisioterapia",
  description: "",
  questions: [question()],
  ...overrides,
});

describe("validateTemplateForm", () => {
  it("um modelo completo não tem erros", () => {
    expect(hasErrors(validateTemplateForm(form()))).toBe(false);
  });

  it("o nome é obrigatório", () => {
    expect(validateTemplateForm(form({ name: "  " })).name).toBe(
      "Informe o nome do modelo.",
    );
  });

  it("exige de 1 a 100 perguntas", () => {
    expect(validateTemplateForm(form({ questions: [] })).questions).toBe(
      "Adicione ao menos uma pergunta.",
    );
    const many = Array.from({ length: 101 }, () => question());
    expect(validateTemplateForm(form({ questions: many })).questions).toMatch(
      /no máximo 100/,
    );
    expect(
      validateTemplateForm(form({ questions: many.slice(0, 100) })).questions,
    ).toBeUndefined();
  });

  it("a pergunta é obrigatória e tem até 400 caracteres", () => {
    const blank = question({ label: " " });
    const long = question({ label: "a".repeat(401) });
    const limit = question({ label: "a".repeat(400) });
    const errors = validateTemplateForm(
      form({ questions: [blank, long, limit] }),
    );

    expect(errors.items?.[blank.key]?.label).toBe("Escreva a pergunta.");
    expect(errors.items?.[long.key]?.label).toMatch(/no máximo 400/);
    expect(errors.items?.[limit.key]).toBeUndefined();
  });

  it("o texto de ajuda tem até 500 caracteres", () => {
    const long = question({ helpText: "a".repeat(501) });
    const ok = question({ helpText: "a".repeat(500) });
    const errors = validateTemplateForm(form({ questions: [long, ok] }));

    expect(errors.items?.[long.key]?.helpText).toMatch(/no máximo 500/);
    expect(errors.items?.[ok.key]).toBeUndefined();
  });

  it("escolha única e múltipla pedem 2 opções ou mais", () => {
    for (const type of ["SINGLE_CHOICE", "MULTIPLE_CHOICE"] as const) {
      const one = question({ type, options: options("A") });
      const two = question({ type, options: options("A", "B") });
      const errors = validateTemplateForm(form({ questions: [one, two] }));

      expect(errors.items?.[one.key]?.options).toBe(
        "Informe ao menos 2 opções.",
      );
      expect(errors.items?.[two.key]).toBeUndefined();
    }
  });

  it("opção vazia, repetida (sem acento e maiúsculas) ou longa demais é recusada", () => {
    const empty = question({
      type: "SINGLE_CHOICE",
      options: options("A", " "),
    });
    const repeated = question({
      type: "SINGLE_CHOICE",
      options: options("Não", "nao"),
    });
    const long = question({
      type: "SINGLE_CHOICE",
      options: options("A", "b".repeat(101)),
    });
    const errors = validateTemplateForm(
      form({ questions: [empty, repeated, long] }),
    );

    expect(errors.items?.[empty.key]?.options).toMatch(/vazias/);
    expect(errors.items?.[repeated.key]?.options).toMatch(/repetir/);
    expect(errors.items?.[long.key]?.options).toMatch(/no máximo 100/);
  });

  it("aceita no máximo 50 opções", () => {
    const texts = Array.from({ length: 51 }, (_, i) => `Opção ${i}`);
    const many = question({
      type: "MULTIPLE_CHOICE",
      options: options(...texts),
    });

    expect(
      validateTemplateForm(form({ questions: [many] })).items?.[many.key]
        ?.options,
    ).toMatch(/No máximo 50/);
  });

  it("tipos sem opções ignoram as opções que sobraram da troca de tipo", () => {
    const text = question({ type: "SHORT_TEXT", options: options("A") });

    expect(hasErrors(validateTemplateForm(form({ questions: [text] })))).toBe(
      false,
    );
  });

  it("na alteração, uma descrição existente não pode ser apagada", () => {
    expect(validateTemplateForm(form(), true).description).toMatch(
      /não pode ser removida/,
    );
    expect(
      validateTemplateForm(form({ description: "Ficha inicial" }), true)
        .description,
    ).toBeUndefined();
    expect(validateTemplateForm(form(), false).description).toBeUndefined();
  });
});

describe("toQuestionInputs", () => {
  it("monta o corpo da API na ordem da lista, sem id nem position", () => {
    const inputs = toQuestionInputs([
      question({
        label: " Tem alergia? ",
        type: "YES_NO",
        isRequired: true,
        detailLabel: "Qual?",
        helpText: "Inclui remédios",
      }),
      question({
        label: "Esportes",
        type: "MULTIPLE_CHOICE",
        options: options(" Corrida ", "Natação"),
      }),
      question({ label: "Dor", type: "SCALE" }),
    ]);

    expect(inputs).toEqual([
      {
        label: "Tem alergia?",
        type: "YES_NO",
        isRequired: true,
        helpText: "Inclui remédios",
        detailLabel: "Qual?",
      },
      {
        label: "Esportes",
        type: "MULTIPLE_CHOICE",
        isRequired: false,
        options: ["Corrida", "Natação"],
      },
      { label: "Dor", type: "SCALE", isRequired: false },
    ]);
  });

  it("não envia opções nem detalhe que o tipo não aceita", () => {
    const [input] = toQuestionInputs([
      question({
        type: "NUMBER",
        options: options("A", "B"),
        detailLabel: "Qual?",
      }),
    ]);

    expect(input).toEqual({
      label: "Tem alergia?",
      type: "NUMBER",
      isRequired: false,
    });
  });
});

describe("questionsChanged", () => {
  const template: TemplateItem = {
    id: "t1",
    name: "Fisioterapia",
    description: null,
    isActive: true,
    currentVersion: {
      id: "v1",
      version: 1,
      questions: [
        {
          id: "q1",
          position: 1,
          label: "Tem alergia?",
          helpText: null,
          type: "YES_NO",
          isRequired: true,
          options: [],
          detailLabel: "Qual?",
        },
        {
          id: "q2",
          position: 2,
          label: "Esportes",
          helpText: null,
          type: "MULTIPLE_CHOICE",
          isRequired: false,
          options: ["Corrida", "Natação"],
          detailLabel: null,
        },
      ],
    },
  };
  const initial = () => draftFromTemplate(template, key);

  it("o editor nasce com as perguntas da versão vigente", () => {
    const drafts = initial();

    expect(drafts.map((d) => d.label)).toEqual(["Tem alergia?", "Esportes"]);
    expect(drafts[1].options.map((o) => o.text)).toEqual([
      "Corrida",
      "Natação",
    ]);
    expect(drafts[0].detailLabel).toBe("Qual?");
  });

  it("sem mudança nas perguntas, não há versão nova", () => {
    expect(questionsChanged(initial(), initial())).toBe(false);
  });

  it("editar um texto, reordenar ou remover conta como mudança", () => {
    const edited = initial();
    edited[0].label = "Tem alguma alergia?";
    const reordered = initial().reverse();
    const removed = initial().slice(0, 1);

    expect(questionsChanged(edited, initial())).toBe(true);
    expect(questionsChanged(reordered, initial())).toBe(true);
    expect(questionsChanged(removed, initial())).toBe(true);
  });
});
