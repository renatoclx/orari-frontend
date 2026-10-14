"use server";

import { revalidatePath } from "next/cache";
import {
  validateServiceForm,
  type ServiceFormValues,
} from "@/components/services/service-validation";
import { ApiError } from "@/services/api";
import { createService, updateService } from "@/services/service.service";
import type { ServiceInput } from "@/types/service";

export type ServiceField = keyof ServiceFormValues;

export type ServiceActionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      /** Campo do formulário a que o erro se refere, quando houver. */
      field?: ServiceField;
    };

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Lê o formulário, valida de novo no servidor e monta o corpo da API.
function parseForm(
  data: FormData,
): { input: ServiceInput } | { error: ServiceActionResult } {
  const values: ServiceFormValues = {
    name: text(data, "name"),
    duration: text(data, "duration"),
    price: text(data, "price"),
  };

  const errors = validateServiceForm(values);
  const invalid = (Object.keys(errors) as ServiceField[])[0];
  if (invalid) {
    return {
      error: { ok: false, message: errors[invalid] ?? "", field: invalid },
    };
  }

  const color = text(data, "color");
  return {
    input: {
      name: values.name,
      description: text(data, "description") || null,
      // Centavos → reais, com até 2 casas decimais.
      price: values.price ? Number(values.price) / 100 : null,
      duration: Number(values.duration),
      color: HEX_COLOR.test(color) ? color : null,
    },
  };
}

function failure(error: unknown): ServiceActionResult {
  if (error instanceof ApiError) {
    // O 409 é nome duplicado: aparece no campo.
    return {
      ok: false,
      message: error.message,
      field: error.status === 409 ? "name" : undefined,
    };
  }
  throw error;
}

export async function createServiceAction(
  data: FormData,
): Promise<ServiceActionResult> {
  const parsed = parseForm(data);
  if ("error" in parsed) return parsed.error;

  try {
    await createService(parsed.input);
  } catch (error) {
    return failure(error);
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
    return failure(error);
  }

  revalidatePath("/servicos");
  return { ok: true };
}
