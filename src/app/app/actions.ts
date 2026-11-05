"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  firstName,
  newPasswordErrors,
  phoneError,
} from "@/components/client-app/client-app";
import { safeReturnPath } from "@/lib/app-routes";
import { ApiError } from "@/services/api";
import {
  changeAccountPassword,
  loginAccount,
  logoutAccount,
  redeemAccessLink,
  registerAccount,
} from "@/services/app-account.service";
import { joinPlace } from "@/services/app-place.service";
import {
  bookAppointment,
  cancelAppointment,
  getAvailability,
} from "@/services/app-booking.service";
import type { Slot } from "@/components/client-app/booking-slots";
import { isUuid } from "@/lib/uuid";
import {
  orNull,
  profileErrors,
  type ProfileFields,
} from "@/components/client-app/profile";
import { lookupCep, type CepLookup } from "@/services/cep.service";
import {
  findCity,
  removeProfilePhoto,
  saveProfile,
  uploadProfilePhoto,
} from "@/services/app-profile.service";
import { toDateString } from "@/utils/time";
import { isDateString } from "@/utils/time";
import {
  clearAppSession,
  getAppToken,
  setAppSession,
} from "@/services/app-session";
import { onlyDigits } from "@/utils/masks";

// Server Actions do app do cliente (screens/app-cliente.md). Validam de novo o
// que o formulário já validou (o navegador pode ser burlado) e só então chamam a API.

/** Estado devolvido a cada envio: os campos para repreencher e os erros. */
export type AppFormState = {
  values: Record<string, string>;
  fieldErrors: Record<string, string | undefined>;
  /** Erro geral (credenciais recusadas, telefone já usado, API fora do ar). */
  message?: string;
};

const text = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

const hasErrors = (errors: AppFormState["fieldErrors"]) =>
  Object.values(errors).some(Boolean);

/** Entrar com telefone e senha. */
export async function appLoginAction(
  _previous: AppFormState | undefined,
  formData: FormData,
): Promise<AppFormState> {
  const phone = text(formData, "phone");
  const password = text(formData, "password");
  const fieldErrors = {
    phone: phoneError(phone),
    password: password ? undefined : "Informe sua senha.",
  };
  const values = { phone };
  if (hasErrors(fieldErrors)) return { values, fieldErrors };

  try {
    await setAppSession(
      await loginAccount({ phone: onlyDigits(phone), password }),
    );
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    // Genérica de propósito: não revela se o telefone tem conta.
    const message =
      error.status === 401 ? "Telefone ou senha incorretos." : error.message;
    return { values, fieldErrors: {}, message };
  }
  // Fora do try: o redirect lança um erro especial do Next. Veio da página de
  // um estabelecimento: volta para ela.
  redirect(safeReturnPath(formData.get("voltar")) ?? "/app");
}

/** Criar a conta: nome, telefone, senha e confirmação. */
export async function appRegisterAction(
  _previous: AppFormState | undefined,
  formData: FormData,
): Promise<AppFormState> {
  const name = text(formData, "name").trim();
  const phone = text(formData, "phone");
  const password = text(formData, "password");
  const passwordConfirmation = text(formData, "passwordConfirmation");
  const fieldErrors = {
    name: name.length >= 2 ? undefined : "Informe seu nome.",
    phone: phoneError(phone),
    ...newPasswordErrors(password, passwordConfirmation),
  };
  const values = { name, phone };
  if (hasErrors(fieldErrors)) return { values, fieldErrors };

  try {
    await setAppSession(
      await registerAccount({
        name,
        phone: onlyDigits(phone),
        password,
        passwordConfirmation,
      }),
    );
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { values, fieldErrors: {}, message: error.message };
  }
  redirect(
    safeReturnPath(formData.get("voltar")) ??
      `/app?bemVindo=${encodeURIComponent(firstName(name))}`,
  );
}

/**
 * Usa o link de acesso da clínica. Entrado no app, só liga o estabelecimento à
 * conta; sem a conta, a senha cria a conta ou é a senha nova da que existe.
 */
export async function appAccessLinkAction(
  token: string,
  needsPhone: boolean,
  _previous: AppFormState | undefined,
  formData: FormData,
): Promise<AppFormState> {
  const loggedIn = Boolean(await getAppToken());
  const phone = text(formData, "phone");
  const password = text(formData, "password");
  const passwordConfirmation = text(formData, "passwordConfirmation");
  const fieldErrors = loggedIn
    ? {}
    : {
        phone: needsPhone ? phoneError(phone) : undefined,
        ...newPasswordErrors(password, passwordConfirmation),
      };
  const values = { phone };
  if (hasErrors(fieldErrors)) return { values, fieldErrors };

  try {
    const result = await redeemAccessLink(
      loggedIn
        ? { token }
        : {
            token,
            password,
            passwordConfirmation,
            ...(needsPhone && { phone: onlyDigits(phone) }),
          },
    );
    if (result.token && result.expiresAt) {
      await setAppSession({ token: result.token, expiresAt: result.expiresAt });
    }
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { values, fieldErrors: {}, message: error.message };
  }
  redirect("/app");
}

/** Sair do app neste aparelho. */
export async function appLogoutAction(): Promise<void> {
  try {
    await logoutAccount();
  } catch {
    // Sem a API, sai do mesmo jeito: o cookie é apagado aqui.
  }
  await clearAppSession();
  redirect("/app/entrar?saiu=1");
}

/**
 * Entra sozinho num estabelecimento: vira cliente dele, como não confirmado
 * (até 2 agendamentos futuros até a clínica confirmar).
 */
export async function appJoinPlaceAction(
  slug: string,
): Promise<{ ok: false; message: string } | undefined> {
  try {
    await joinPlace(slug);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }
  redirect(`/app/local/${encodeURIComponent(slug)}?entrou=1`);
}

type BookingChoice = { serviceId: string; professionalId: string };

/** Horários livres de um dia, para a tela de agendar. */
export async function appAvailabilityAction(
  slug: string,
  choice: BookingChoice & { date: string },
): Promise<{ ok: true; slots: Slot[] } | { ok: false; message: string }> {
  if (
    !isUuid(choice.serviceId) ||
    !isUuid(choice.professionalId) ||
    !isDateString(choice.date)
  ) {
    return { ok: false, message: "Escolha o serviço, o profissional e o dia." };
  }
  try {
    return { ok: true, slots: await getAvailability(slug, choice) };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }
}

/**
 * Agenda o horário escolhido. Horário que deixou de estar livre (409) volta
 * com `refresh`, para a tela buscar os horários de novo.
 */
export async function appBookAction(
  slug: string,
  choice: BookingChoice & { startAt: string },
): Promise<{ ok: false; message: string; refresh?: boolean } | undefined> {
  if (!isUuid(choice.serviceId) || !isUuid(choice.professionalId)) {
    return { ok: false, message: "Escolha o serviço e o profissional." };
  }
  try {
    await bookAppointment(slug, choice);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message, refresh: error.status === 409 };
  }
  redirect("/app?agendado=1");
}

/** Cancela um avulso do próprio cliente (a API confere o prazo da clínica). */
export async function appCancelAction(
  slug: string,
  id: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isUuid(id)) return { ok: false, message: "Agendamento inválido." };
  try {
    await cancelAppointment(slug, id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }
  // A lista e o "Próximo agendamento" do Início mudam.
  revalidatePath("/app/agendamentos");
  revalidatePath("/app");
  return { ok: true };
}

/** Troca a senha conferindo a atual (Menu → Segurança). */
export async function appChangePasswordAction(
  _previous: AppFormState | undefined,
  formData: FormData,
): Promise<AppFormState> {
  const currentPassword = text(formData, "currentPassword");
  const newPassword = text(formData, "password");
  const newPasswordConfirmation = text(formData, "passwordConfirmation");
  const fieldErrors = {
    currentPassword: currentPassword ? undefined : "Informe a senha atual.",
    ...newPasswordErrors(newPassword, newPasswordConfirmation),
  };
  if (hasErrors(fieldErrors)) return { values: {}, fieldErrors };

  try {
    await changeAccountPassword({
      currentPassword,
      newPassword,
      newPasswordConfirmation,
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    // Senha atual errada: o aviso vai no próprio campo.
    if (error.status === 400 && error.message === "Senha atual incorreta") {
      return {
        values: {},
        fieldErrors: { currentPassword: "Senha atual incorreta." },
      };
    }
    return { values: {}, fieldErrors: {}, message: error.message };
  }
  redirect("/app/menu?senha=1");
}

/** Endereço pelo CEP (ViaCEP), consultado no servidor. */
export async function appCepAction(cep: string): Promise<CepLookup> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return { status: "not-found" };
  return lookupCep(digits);
}

const PROFILE_FIELDS: (keyof ProfileFields)[] = [
  "name",
  "phone",
  "email",
  "document",
  "birthDate",
  "profession",
  "cep",
  "street",
  "number",
  "complement",
  "neighborhood",
  "cityName",
  "cityState",
];

/**
 * Salva Meus dados (a API copia para o cadastro em cada clínica). Trocar o
 * telefone manda junto a senha atual. Recusas da API vão para o campo certo.
 */
export async function appProfileAction(
  originalPhone: string,
  _previous: AppFormState | undefined,
  formData: FormData,
): Promise<AppFormState> {
  const fields = Object.fromEntries(
    PROFILE_FIELDS.map((name) => [name, text(formData, name)]),
  ) as ProfileFields;
  const currentPassword = text(formData, "currentPassword");
  const values = { ...fields };
  const phoneChanged = onlyDigits(fields.phone) !== originalPhone;
  const fieldErrors: AppFormState["fieldErrors"] = {
    ...profileErrors(fields, toDateString(new Date(), "America/Sao_Paulo")),
    ...(phoneChanged &&
      !currentPassword && {
        currentPassword: "Para trocar o telefone, informe a senha atual.",
      }),
  };
  if (hasErrors(fieldErrors)) return { values, fieldErrors };

  try {
    const cep = onlyDigits(fields.cep);
    const city = cep
      ? await findCity(fields.cityName, fields.cityState)
      : undefined;
    await saveProfile({
      name: fields.name.trim(),
      phone: onlyDigits(fields.phone),
      email: orNull(fields.email),
      document: orNull(onlyDigits(fields.document)),
      birthDate: orNull(fields.birthDate),
      profession: orNull(fields.profession),
      address: city
        ? {
            cep,
            street: fields.street.trim(),
            number: fields.number.trim(),
            complement: orNull(fields.complement),
            neighborhood: orNull(fields.neighborhood),
            cityId: city.id,
          }
        : null,
      ...(phoneChanged && { currentPassword }),
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    const field = error.message.startsWith("Este CPF")
      ? "document"
      : error.message === "Senha atual incorreta"
        ? "currentPassword"
        : error.message.includes("telefone")
          ? "phone"
          : error.message === "Cidade não encontrada"
            ? "cep"
            : undefined;
    return field
      ? { values, fieldErrors: { [field]: error.message } }
      : { values, fieldErrors: {}, message: error.message };
  }
  revalidatePath("/app", "layout");
  redirect("/app/menu?dados=1");
}

/** Troca a foto (já reduzida no celular); a API copia para cada clínica. */
export async function appPhotoAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const photo = formData.get("photo");
  if (!(photo instanceof Blob) || photo.size === 0) {
    return { ok: false, message: "Escolha uma foto." };
  }
  try {
    await uploadProfilePhoto(photo);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }
  revalidatePath("/app", "layout");
  return { ok: true };
}

export async function appRemovePhotoAction(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  try {
    await removeProfilePhoto();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }
  revalidatePath("/app", "layout");
  return { ok: true };
}
