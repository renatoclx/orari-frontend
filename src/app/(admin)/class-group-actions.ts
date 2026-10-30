"use server";

import { revalidatePath } from "next/cache";
import {
  capacityError,
  hasErrors,
  nameError,
  validateClassGroupForm,
} from "@/components/class-groups/class-group-rules";
import { WEEK_DAYS } from "@/components/recurrences/recurrence-schedule";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import { getCurrentUser } from "@/services/auth.service";
import {
  createClassGroup,
  listClassGroupMembers,
  listClassGroups,
  updateClassGroup,
} from "@/services/class-group.service";
import type {
  ClassGroupInput,
  ClassGroupItem,
  ClassGroupMember,
} from "@/types/class-group";

export type ClassGroupActionResult = { ok: true } | ActionFailure;

const BASE_PATH = "/turmas";
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Cadastro da turma. Repete no servidor o que o formulário confere; o resto
 * (serviço que aceita turma, funcionamento, outras turmas do profissional) é
 * da API.
 */
export async function createClassGroupAction(
  input: ClassGroupInput,
): Promise<ClassGroupActionResult> {
  const invalidDay = input.days.some(
    (day) =>
      !WEEK_DAYS.some((d) => d.id === day.weekDay) || !TIME.test(day.startTime),
  );
  if (!isUuid(input.serviceId) || !isUuid(input.professionalId) || invalidDay) {
    return { ok: false, message: "Revise os dados da turma." };
  }

  // A sobreposição dos horários é conferida pela API, com a duração real do serviço.
  const errors = validateClassGroupForm({
    name: input.name ?? "",
    serviceId: input.serviceId,
    professionalId: input.professionalId,
    capacity: String(input.capacity),
    slots: input.days.map((day, index) => ({ key: String(index), ...day })),
    duration: 0,
  });
  if (hasErrors(errors)) {
    const message = Object.values(errors).find((v) => typeof v === "string");
    return { ok: false, message: message ?? "Revise os dados da turma." };
  }

  try {
    await createClassGroup({ ...input, name: input.name?.trim() || undefined });
  } catch (error) {
    return failureFrom(error);
  }

  revalidatePath(BASE_PATH);
  return { ok: true };
}

/** Alteração: só nome e vagas. Nome vazio vai como `null`, que o remove. */
export async function updateClassGroupAction(
  id: string,
  input: { name: string; capacity: string },
): Promise<ClassGroupActionResult> {
  if (!isUuid(id)) return { ok: false, message: "Turma não encontrada." };
  const message = nameError(input.name) ?? capacityError(input.capacity);
  if (message) return { ok: false, message };

  try {
    await updateClassGroup(id, {
      name: input.name.trim() || null,
      capacity: Number(input.capacity),
    });
  } catch (error) {
    // Ex.: vagas abaixo dos alunos de uma sessão futura (409).
    return failureFrom(error);
  }

  revalidatePath(BASE_PATH);
  return { ok: true };
}

/** Inativa ou reativa; a reativação confere de novo serviço, profissional e horários. */
export async function setClassGroupActiveAction(
  id: string,
  isActive: boolean,
): Promise<ClassGroupActionResult> {
  if (!isUuid(id)) return { ok: false, message: "Turma não encontrada." };

  try {
    await updateClassGroup(id, { isActive });
  } catch (error) {
    return failureFrom(error);
  }

  revalidatePath(BASE_PATH);
  return { ok: true };
}

export type ServiceClassGroupsResult =
  | { ok: true; canManage: boolean; classGroups: ClassGroupItem[] }
  | ActionFailure;

/**
 * Turmas ativas de um serviço, para repor uma aula em turma. Só o ADMIN mexe
 * em turma: para os demais, `canManage` é falso e a lista vem vazia (a tela
 * nem mostra as ações de turma).
 */
export async function listServiceClassGroupsAction(
  serviceId: string,
): Promise<ServiceClassGroupsResult> {
  if (!isUuid(serviceId)) return { ok: false, message: "Dados inválidos." };
  try {
    const user = await getCurrentUser();
    if (user.type !== "ADMIN") {
      return { ok: true, canManage: false, classGroups: [] };
    }
    const result = await listClassGroups({
      isActive: true,
      serviceId,
      page: 1,
      limit: 100,
    });
    return { ok: true, canManage: true, classGroups: result.items };
  } catch (error) {
    return failureFrom(error);
  }
}

export type ClassGroupMembersResult =
  { ok: true; members: ClassGroupMember[] } | ActionFailure;

/** Alunos fixos da turma, para a Visualização. */
export async function listClassGroupMembersAction(
  id: string,
): Promise<ClassGroupMembersResult> {
  if (!isUuid(id)) return { ok: false, message: "Dados inválidos." };
  try {
    return { ok: true, members: await listClassGroupMembers(id) };
  } catch (error) {
    return failureFrom(error);
  }
}
