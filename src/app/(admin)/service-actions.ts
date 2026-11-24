"use server";

import { revalidatePath } from "next/cache";
import {
  parseCommission,
  validateServiceForm,
  type ServiceErrorField,
  type ServiceFormValues,
} from "@/components/services/service-validation";
import { ApiError } from "@/services/api";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { formText } from "@/lib/form-data";
import { listPeople } from "@/services/people.service";
import {
  createService,
  deleteService,
  listServiceProfessionals,
  setServiceActive,
  setServiceProfessionals,
  updateService,
} from "@/services/service.service";
import { isUuid } from "@/lib/uuid";
import type { ServiceInput } from "@/types/service";

/** Campos do formulário de serviço a que um erro pode se referir. */
export type ServiceField = ServiceErrorField;

export type ServiceActionResult =
  | { ok: true }
  | (ActionFailure<ServiceField> & {
      /** A exclusão foi recusada por haver vínculos (409). */
      conflict?: boolean;
    });

// Mesma regra do backend: #RGB ou #RRGGBB.
const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Lê o formulário, valida de novo no servidor e monta o corpo da API.
function parseForm(
  data: FormData,
): { input: ServiceInput } | { error: ServiceActionResult } {
  const values: ServiceFormValues = {
    name: formText(data, "name"),
    duration: formText(data, "duration"),
    price: formText(data, "price"),
  };

  const errors = validateServiceForm(values);
  const invalid = (Object.keys(errors) as ServiceField[])[0];
  if (invalid) {
    return {
      error: { ok: false, message: errors[invalid] ?? "", field: invalid },
    };
  }

  // A comissão só vem no formulário do ADMIN (campo de controle); sem ele,
  // nada é enviado e a gravada não muda. A API confere de novo (403 e 400).
  let commission = {};
  if (data.get("commissionEnabled") === "1") {
    const parsed = parseCommission({
      type: formText(data, "commissionType"),
      percent: formText(data, "commissionPercent"),
      cents: formText(data, "commissionCents"),
    });
    if (!parsed.ok) {
      return {
        error: { ok: false, message: parsed.error, field: "commission" },
      };
    }
    commission = {
      commissionType: parsed.commissionType,
      commissionValue: parsed.commissionValue,
    };
  }

  const color = formText(data, "color");
  return {
    input: {
      ...commission,
      name: values.name,
      description: formText(data, "description") || null,
      // Centavos → reais, com até 2 casas decimais.
      price: values.price ? Number(values.price) / 100 : null,
      duration: Number(values.duration),
      color: HEX_COLOR.test(color) ? color : null,
      // Só com Turmas liberadas o campo está na tela (campo de controle
      // classesEnabled); sem ele, nada vai e o valor gravado não muda. O
      // Switch só envia o campo quando está ligado ("on").
      ...(data.get("classesEnabled") === "1" && {
        allowsClasses: data.get("allowsClasses") === "on",
      }),
    },
  };
}

// Profissionais marcados no formulário (só ids válidos; a API confere o resto).
const professionalIdsOf = (data: FormData) =>
  data
    .getAll("professionalIds")
    .filter(
      (value): value is string => typeof value === "string" && isUuid(value),
    );

// Grava quem atende o serviço; numa falha, o serviço já ficou salvo.
async function saveProfessionals(
  id: string,
  data: FormData,
): Promise<ServiceActionResult | null> {
  if (data.get("professionalsLoaded") !== "1") return null;
  try {
    await setServiceProfessionals(id, professionalIdsOf(data));
    return null;
  } catch (error) {
    const failure = failureFrom(error);
    return {
      ok: false,
      message: `Serviço salvo, mas os profissionais não: ${failure.message}`,
    };
  }
}

/**
 * Profissionais ativos (para marcar) e os que já atendem o serviço. Sem
 * serviço (cadastro), nenhum vem marcado.
 */
export async function loadServiceProfessionalsAction(
  serviceId?: string,
): Promise<
  | {
      ok: true;
      professionals: { id: string; name: string }[];
      selected: string[];
    }
  | ActionFailure
> {
  if (serviceId !== undefined && !isUuid(serviceId)) {
    return { ok: false, message: "Serviço inválido." };
  }
  try {
    const [people, linked] = await Promise.all([
      listPeople({ type: "PROFESSIONAL", isActive: true, page: 1, limit: 100 }),
      serviceId ? listServiceProfessionals(serviceId) : [],
    ]);
    return {
      ok: true,
      professionals: people.items
        .map(({ id, name }) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      selected: linked.map((person) => person.id),
    };
  } catch (error) {
    return failureFrom(error);
  }
}

/** Cadastro: o serviço nasce sempre ativo (padrão da API). */
export async function createServiceAction(
  data: FormData,
): Promise<ServiceActionResult> {
  const parsed = parseForm(data);
  if ("error" in parsed) return parsed.error;

  let created;
  try {
    created = await createService(parsed.input);
  } catch (error) {
    // O 409 é nome duplicado: aparece no campo.
    return failureFrom(error, "name" as const);
  }

  const professionalsFailure = await saveProfessionals(created.id, data);
  revalidatePath("/servicos");
  if (professionalsFailure) return professionalsFailure;
  return { ok: true };
}

/** Alteração: campos opcionais vazios vão como `null`, que é como a API os limpa. */
export async function updateServiceAction(
  id: string,
  data: FormData,
): Promise<ServiceActionResult> {
  const parsed = parseForm(data);
  if ("error" in parsed) return parsed.error;

  try {
    await updateService(id, parsed.input);
  } catch (error) {
    // O 409 é nome duplicado (no campo) ou desmarcar "Aceita turma" com turma
    // ativa (só no aviso): a mensagem da API diz qual.
    if (
      error instanceof ApiError &&
      error.status === 409 &&
      /turma/i.test(error.message)
    ) {
      return failureFrom(error);
    }
    return failureFrom(error, "name" as const);
  }

  const professionalsFailure = await saveProfessionals(id, data);
  revalidatePath("/servicos");
  if (professionalsFailure) return professionalsFailure;
  return { ok: true };
}

/** Inativa ou ativa o serviço (campo `isActive`). */
export async function setServiceActiveAction(
  id: string,
  isActive: boolean,
): Promise<ServiceActionResult> {
  try {
    await setServiceActive(id, isActive);
  } catch (error) {
    return failureFrom(error);
  }

  revalidatePath("/servicos");
  return { ok: true };
}

/** Exclusão: a API recusa (409) quando há agendamentos, recorrências ou planos vinculados. */
export async function deleteServiceAction(
  id: string,
): Promise<ServiceActionResult> {
  try {
    await deleteService(id);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        message: error.message,
        conflict: error.status === 409,
      };
    }
    throw error;
  }

  revalidatePath("/servicos");
  return { ok: true };
}
