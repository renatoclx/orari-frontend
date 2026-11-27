import {
  draftFromValue,
  type AnswerDraft,
} from "@/components/anamnesis/records/answer-form";
import type { AnamnesisDetail, TemplateQuestion } from "@/types/anamnesis";
import { normalizeText } from "@/utils/text";

// A mesma pergunta nas duas versões: mesmo texto (sem diferenciar acentos nem
// maiúsculas) e mesmo tipo. As perguntas de cada versão têm ids próprios, então
// o id não serve para casar uma com a outra.
const questionKey = (question: Pick<TemplateQuestion, "label" | "type">) =>
  `${question.type}:${normalizeText(question.label.trim())}`;

/**
 * Atualizar a ficha para a versão nova do modelo: leva a resposta mais recente
 * de cada pergunta da ficha antiga (os acompanhamentos incluídos) para a mesma
 * pergunta da versão nova. Pergunta nova fica em branco; nas escolhas, as
 * opções que deixaram de existir são descartadas. Devolve os campos da tela,
 * pelo id da pergunta da versão nova.
 */
export function carryOverAnswers(
  from: Pick<AnamnesisDetail, "version" | "current">,
  questions: TemplateQuestion[],
): Record<string, AnswerDraft> {
  const oldById = new Map(from.version.questions.map((q) => [q.id, q]));
  const valueByKey = new Map<string, unknown>();
  for (const answer of from.current) {
    const question = oldById.get(answer.questionId);
    if (question) valueByKey.set(questionKey(question), answer.value);
  }

  const drafts: Record<string, AnswerDraft> = {};
  for (const question of questions) {
    const key = questionKey(question);
    if (!valueByKey.has(key)) continue;
    const draft = draftFromValue(question, valueByKey.get(key));

    if (
      question.type === "SINGLE_CHOICE" &&
      !question.options.includes(draft.text)
    ) {
      continue;
    }
    if (question.type === "MULTIPLE_CHOICE") {
      draft.choices = draft.choices.filter((choice) =>
        question.options.includes(choice),
      );
      if (draft.choices.length === 0) continue;
    }
    drafts[question.id] = draft;
  }
  return drafts;
}
