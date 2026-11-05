"use server";

import { redirect } from "next/navigation";
import {
  firstName,
  newPasswordErrors,
  phoneError,
} from "@/components/client-app/client-app";
import { safeReturnPath } from "@/lib/app-routes";
import { ApiError } from "@/services/api";
import {
  loginAccount,
  logoutAccount,
  redeemAccessLink,
  registerAccount,
} from "@/services/app-account.service";
import { joinPlace } from "@/services/app-place.service";
import {
  bookAppointment,
  getAvailability,
} from "@/services/app-booking.service";
import type { Slot } from "@/components/client-app/booking-slots";
import { isUuid } from "@/lib/uuid";
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
