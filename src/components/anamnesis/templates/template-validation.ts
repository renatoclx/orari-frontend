import { isChoiceType } from "@/components/anamnesis/templates/question-types";
import type {
  QuestionType,
  TemplateItem,
  TemplateQuestionInput,
} from "@/types/anamnesis";
import { normalizeText } from "@/utils/text";

// Limites da API (anamnesis-question.dto.ts e create-anamnesis-template.dto.ts).
export const MAX_QUESTIONS = 100;
export const LABEL_MAX = 400;
export const HELP_MAX = 500;
export const OPTION_MAX = 100;
export const MAX_OPTIONS = 50;
const MIN_CHOICE_OPTIONS = 2;

/** Opção como o editor a vê: a chave estável permite remover e reordenar sem trocar o foco. */
export type OptionDraft = { key: string; text: string };

/** Pergunta como o editor a edita (textos), com a chave da linha. */
export type QuestionDraft = {
  key: string;
  label: string;
  helpText: string;
  type: QuestionType;
  isRequired: boolean;
  options: OptionDraft[];
  detailLabel: string;
};

export type TemplateFormValues = {
  name: string;
  description: string;
  questions: QuestionDraft[];
};

export type QuestionErrors = {
  label?: string;
  helpText?: string;
  options?: string;
  detailLabel?: string;
};

export type TemplateFormErrors = {
  name?: string;
  description?: string;
  /** Erro da lista inteira (nenhuma pergunta ou pergunta demais). */
  questions?: string;
  /** Erro de cada pergunta, pela chave da linha. */
  items?: Record<string, QuestionErrors>;
};

/** Pergunta nova: texto curto, opcional. */
export function emptyQuestion(key: string): QuestionDraft {
  return {
    key,
    label: "",
    helpText: "",
    type: "SHORT_TEXT",
    isRequired: false,
    options: [],
    detailLabel: "",
  };
}

/** Pergunta de um modelo já salvo → rascunho do editor. `newKey` gera as chaves. */
export function draftFromTemplate(
  template: TemplateItem,
  newKey: () => string,
): QuestionDraft[] {
  return template.currentVersion.questions.map((question) => ({
    key: newKey(),
    label: question.label,
    helpText: question.helpText ?? "",
    type: question.type,
    isRequired: question.isRequired,
    options: question.options.map((text) => ({ key: newKey(), text })),
    detailLabel: question.detailLabel ?? "",
  }));
}

/**
 * Regras do backend (business-rules.md, "Anamnese"): nome obrigatório; de 1 a
 * 100 perguntas; texto de até 400, ajuda de até 500; escolha única e múltipla com
 * 2 a 50 opções sem repetir (ignorando acento e maiúsculas), os demais tipos sem
 * opções; detalhe só em sim ou não.
 *
 * `descriptionRequired`: na alteração de um modelo que já tem descrição, a API não
 * aceita apagá-la (só trocar o texto), então o campo não pode ficar vazio.
 */
export function validateTemplateForm(
  values: TemplateFormValues,
  descriptionRequired = false,
): TemplateFormErrors {
  const errors: TemplateFormErrors = {};

  if (!values.name.trim()) errors.name = "Informe o nome do modelo.";
  if (descriptionRequired && !values.description.trim()) {
    errors.description =
      "A descrição não pode ser removida; altere o texto se for preciso.";
  }

  if (values.questions.length === 0) {
    errors.questions = "Adicione ao menos uma pergunta.";
  } else if (values.questions.length > MAX_QUESTIONS) {
    errors.questions = `Um modelo tem no máximo ${MAX_QUESTIONS} perguntas.`;
  }

  const items: Record<string, QuestionErrors> = {};
  for (const question of values.questions) {
    const found: QuestionErrors = {};
    if (!question.label.trim()) {
      found.label = "Escreva a pergunta.";
    } else if (question.label.trim().length > LABEL_MAX) {
      found.label = `A pergunta tem no máximo ${LABEL_MAX} caracteres.`;
    }
    if (question.helpText.trim().length > HELP_MAX) {
      found.helpText = `O texto de ajuda tem no máximo ${HELP_MAX} caracteres.`;
    }
    if (
      question.type === "YES_NO" &&
      question.detailLabel.trim().length > LABEL_MAX
    ) {
      found.detailLabel = `O detalhe tem no máximo ${LABEL_MAX} caracteres.`;
    }
    if (isChoiceType(question.type)) {
      const texts = question.options.map((option) => option.text.trim());
      if (texts.some((text) => !text)) {
        found.options = "Preencha ou remova as opções vazias.";
      } else if (texts.length < MIN_CHOICE_OPTIONS) {
        found.options = `Informe ao menos ${MIN_CHOICE_OPTIONS} opções.`;
      } else if (texts.length > MAX_OPTIONS) {
        found.options = `No máximo ${MAX_OPTIONS} opções.`;
      } else if (texts.some((text) => text.length > OPTION_MAX)) {
        found.options = `Cada opção tem no máximo ${OPTION_MAX} caracteres.`;
      } else if (new Set(texts.map(normalizeText)).size !== texts.length) {
        found.options = "As opções não podem se repetir.";
      }
    }
    if (Object.keys(found).length > 0) items[question.key] = found;
  }
  if (Object.keys(items).length > 0) errors.items = items;

  return errors;
}

export function hasErrors(errors: TemplateFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Perguntas no formato da API, na ordem da lista (sem `id` nem `position`: a API
 * recusa campos desconhecidos). Campos vazios ou que o tipo não aceita ficam de fora.
 */
export function toQuestionInputs(
  questions: QuestionDraft[],
): TemplateQuestionInput[] {
  return questions.map((question) => {
    const helpText = question.helpText.trim();
    const detailLabel = question.detailLabel.trim();
    return {
      label: question.label.trim(),
      type: question.type,
      isRequired: question.isRequired,
      ...(helpText && { helpText }),
      ...(isChoiceType(question.type) && {
        options: question.options.map((option) => option.text.trim()),
      }),
      ...(question.type === "YES_NO" && detailLabel && { detailLabel }),
    };
  });
}

/** As perguntas mudaram? Só então a alteração envia `questions` (e cria uma nova versão). */
export function questionsChanged(
  current: QuestionDraft[],
  initial: QuestionDraft[],
): boolean {
  return (
    JSON.stringify(toQuestionInputs(current)) !==
    JSON.stringify(toQuestionInputs(initial))
  );
}
