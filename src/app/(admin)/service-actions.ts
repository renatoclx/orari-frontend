"use server";

import { revalidatePath } from "next/cache";
import {
  validateServiceForm,
  type ServiceFormValues,
} from "@/components/services/service-validation";
import { ApiError } from "@/services/api";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { formText } from "@/lib/form-data";
import {
  createService,
  deleteService,
  setServiceActive,
  updateService,
} from "@/services/service.service";
import type { ServiceInput } from "@/types/service";

export type ServiceField = keyof ServiceFormValues;

export type ServiceActionResult =
  | { ok: true }
  | (ActionFailure<ServiceField> & {
      /** A exclusão foi recusada por haver vínculos (409). */
      conflict?: boolean;
    });

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

  const color = formText(data, "color");
  return {
    input: {
      name: values.name,
      description: formText(data, "description") || null,
      // Centavos → reais, com até 2 casas decimais.
      price: values.price ? Number(values.price) / 100 : null,
      duration: Number(values.duration),
      color: HEX_COLOR.test(color) ? color : null,
    },
  };
}

export async function createServiceAction(
  data: FormData,
): Promise<ServiceActionResult> {
  const parsed = parseForm(data);
  if ("error" in parsed) return parsed.error;

  try {
    await createService(parsed.input);
  } catch (error) {
    // O 409 é nome duplicado: aparece no campo.
    return failureFrom(error, "name" as const);
  }

  revalidatePath("/servicos");
  return { ok: true };
}

export async function updateServiceAction(
  id: string,
  data: FormData,
): Promise<ServiceActionResult> {
  const parsed = parseForm(data);
  if ("error" in parsed) return parsed.error;

  try {
    await updateService(id, parsed.input);
  } catch (error) {
    // O 409 é nome duplicado: aparece no campo.
    return failureFrom(error, "name" as const);
  }

  revalidatePath("/servicos");
  return { ok: true };
}

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
