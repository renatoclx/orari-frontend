"use server";

import { revalidatePath } from "next/cache";
import {
  profileLinkApplies,
  validatePassword,
  validateUpdateUserForm,
  validateUserForm,
  type UserFormErrors,
  type UserFormValues,
} from "@/components/users/user-validation";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { ApiError } from "@/services/api";
import {
  createUser,
  deleteUser,
  resetUserPassword,
  restoreUser,
  updateUser,
} from "@/services/user.service";
import type { UserType } from "@/types/auth";

/** Campos do formulário de usuário a que um erro pode se referir. */
export type UserField = keyof UserFormValues;

export type UserActionResult = { ok: true } | ActionFailure<UserField>;

const PATH = "/usuarios";

// Primeiro erro da validação, no formato de falha da action (vai para o campo).
function firstError(errors: UserFormErrors): UserActionResult | null {
  const field = (Object.keys(errors) as UserField[])[0];
  return field ? { ok: false, message: errors[field] ?? "", field } : null;
}

// A API responde 409 tanto para e-mail repetido quanto para profissional já
// vinculado: a mensagem diz qual, e o erro vai para o campo certo.
function conflictField(error: unknown): UserField {
  return error instanceof ApiError && /profissional/i.test(error.message)
    ? "peopleId"
    : "email";
}

/**
 * Cadastro: valida de novo no servidor; e-mail repetido (409) vai para o campo.
 * `companyId`: empresa do novo usuário, quando o SUPER_ADMIN o cadastra para
 * outra empresa (ex.: o administrador de uma empresa nova).
 */
export async function createUserAction(
  values: UserFormValues,
  companyId?: string,
): Promise<UserActionResult> {
  const invalid = firstError(validateUserForm(values));
  if (invalid) return invalid;

  try {
    await createUser({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      passwordConfirmation: values.passwordConfirmation,
      type: values.type as UserType,
      ...(companyId && { companyId }),
      ...(profileLinkApplies(values) && { peopleId: values.peopleId }),
    });
  } catch (error) {
    return failureFrom(error, conflictField(error));
  }
  revalidatePath(PATH);
  return { ok: true };
}

/** Alteração de nome, e-mail e tipo (a senha tem rota própria). */
export async function updateUserAction(
  id: string,
  values: Pick<
    UserFormValues,
    "name" | "email" | "type" | "linkProfessional" | "peopleId"
  >,
): Promise<UserActionResult> {
  const invalid = firstError(validateUpdateUserForm(values));
  if (invalid) return invalid;

  try {
    await updateUser(id, {
      name: values.name.trim(),
      email: values.email.trim(),
      type: values.type as UserType,
      // `null` desfaz o vínculo (desligou o interruptor ou virou SUPER_ADMIN).
      peopleId: profileLinkApplies(values) ? values.peopleId : null,
    });
  } catch (error) {
    return failureFrom(error, conflictField(error));
  }
  revalidatePath(PATH);
  return { ok: true };
}

/** Troca de senha, com confirmação. */
export async function resetUserPasswordAction(
  id: string,
  password: string,
  confirmation: string,
): Promise<UserActionResult> {
  const invalid = firstError(validatePassword(password, confirmation));
  if (invalid) return invalid;

  try {
    await resetUserPassword(id, {
      newPassword: password,
      newPasswordConfirmation: confirmation,
    });
  } catch (error) {
    return failureFrom(error);
  }
  return { ok: true };
}

/** Reativação: limpa o deletedAt (409 se o e-mail já estiver com outro ativo). */
export async function restoreUserAction(id: string): Promise<UserActionResult> {
  try {
    await restoreUser(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

/** Inativação (exclusão lógica: preenche o deletedAt). */
export async function deleteUserAction(id: string): Promise<UserActionResult> {
  try {
    await deleteUser(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}
