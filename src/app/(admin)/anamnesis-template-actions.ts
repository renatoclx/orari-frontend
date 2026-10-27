"use server";

import { revalidatePath } from "next/cache";
import {
  hasErrors,
  questionsChanged,
  toQuestionInputs,
  validateTemplateForm,
  type QuestionDraft,
  type TemplateFormValues,
} from "@/components/anamnesis/templates/template-validation";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import { anamnesisAccess } from "@/utils/anamnesis-access";
import { getCurrentUser } from "@/services/auth.service";
import {
  createTemplate,
  getTemplate,
  updateTemplate,
} from "@/services/anamnesis-template.service";
import type { TemplateUpdateInput } from "@/types/anamnesis";

export type TemplateActionResult = { ok: true } | ActionFailure<"name">;

const PATH = "/anamnese/modelos";

// Só o ADMIN gerencia modelos (a API também recusa); conferir aqui evita a chamada.
async function ensureAdmin(): Promise<ActionFailure<"name"> | null> {
  const user = await getCurrentUser();
  return anamnesisAccess(user).isAdmin
    ? null
    : {
        ok: false,
        message: "Só o administrador gerencia os modelos de ficha.",
      };
}

/** Cadastro: o modelo nasce ativo, na versão 1. Nome repetido (409) vai para o campo. */
export async function createTemplateAction(
  values: TemplateFormValues,
): Promise<TemplateActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  if (hasErrors(validateTemplateForm(values))) {
    return { ok: false, message: "Corrija os campos destacados." };
  }

  const description = values.description.trim();
  try {
    await createTemplate({
      name: values.name.trim(),
      ...(description && { description }),
      questions: toQuestionInputs(values.questions),
    });
  } catch (error) {
    return failureFrom(error, "name" as const);
  }
  revalidatePath(PATH);
  return { ok: true };
}

/**
 * Alteração. As perguntas só vão para a API quando mudaram em relação às da
 * versão vigente (relidas aqui, no servidor): renomear ou mudar a descrição não
 * cria uma versão nova, mas reenviar a lista cria, mesmo igual.
 */
export async function updateTemplateAction(
  id: string,
  values: TemplateFormValues,
): Promise<TemplateActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  // O id vem do navegador: fora do formato, nem chega à API.
  if (!isUuid(id)) return { ok: false, message: "Pedido inválido." };

  try {
    const current = await getTemplate(id);
    if (hasErrors(validateTemplateForm(values, Boolean(current.description)))) {
      return { ok: false, message: "Corrija os campos destacados." };
    }

    const initial: QuestionDraft[] = current.currentVersion.questions.map(
      (question) => ({
        key: question.id,
        label: question.label,
        helpText: question.helpText ?? "",
        type: question.type,
        isRequired: question.isRequired,
        options: question.options.map((text) => ({ key: text, text })),
        detailLabel: question.detailLabel ?? "",
      }),
    );
    const description = values.description.trim();
    const input: TemplateUpdateInput = {
      name: values.name.trim(),
      // A API não aceita descrição vazia: sem texto, o campo não é enviado.
      ...(description && { description }),
      ...(questionsChanged(values.questions, initial) && {
        questions: toQuestionInputs(values.questions),
      }),
    };
    await updateTemplate(id, input);
  } catch (error) {
    return failureFrom(error, "name" as const);
  }
  revalidatePath(PATH);
  return { ok: true };
}

/** Inativar impede novas fichas; as existentes continuam acessíveis. Reativar volta ao normal. */
export async function setTemplateActiveAction(
  id: string,
  isActive: boolean,
): Promise<TemplateActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  if (!isUuid(id)) return { ok: false, message: "Pedido inválido." };

  try {
    await updateTemplate(id, { isActive });
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}
