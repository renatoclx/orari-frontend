"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { validatePassword } from "@/components/users/user-validation";
import { FORWARDED_FOR_HEADER, clientIpFrom } from "@/lib/client-ip";
import { ApiError } from "@/services/api";
import * as authService from "@/services/auth.service";
import { clearSession, getRefreshToken, setSession } from "@/services/session";

/**
 * Revoga a sessão no backend, apaga os cookies e volta ao login. Se a API
 * falhar, sai mesmo assim: quem clicou em "Sair" espera sair, e o refresh
 * token não revogado vence sozinho.
 */
export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await authService.logout(refreshToken);
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
    }
  }

  await clearSession();
  // O sinal na URL faz a tela de login mostrar o toast de despedida.
  redirect("/login?loggedOut=1");
}

export type ChangePasswordFields = {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
};

export type ChangePasswordResult =
  | { ok: true }
  | {
      ok: false;
      fieldErrors: Partial<Record<keyof ChangePasswordFields, string>>;
      message?: string;
    };

/**
 * Troca da própria senha (menu do usuário). Valida de novo no servidor e chama
 * a API, que encerra todas as sessões da pessoa; aqui ela entra de novo com a
 * senha nova, para continuar neste aparelho (os outros saem).
 */
export async function changeMyPasswordAction(
  values: ChangePasswordFields,
): Promise<ChangePasswordResult> {
  const fieldErrors = {
    ...(values.currentPassword
      ? {}
      : { currentPassword: "Informe a senha atual." }),
    ...validatePassword(values.password, values.passwordConfirmation),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return { ok: false, fieldErrors };
  }

  // O e-mail serve para entrar de novo depois da troca.
  const { email } = await authService.getCurrentUser();
  try {
    await authService.changeOwnPassword({
      currentPassword: values.currentPassword,
      newPassword: values.password,
      newPasswordConfirmation: values.passwordConfirmation,
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    // Senha atual errada ou nova igual à atual: o aviso vai no campo certo.
    if (error.status === 400 && /senha atual/i.test(error.message)) {
      return {
        ok: false,
        fieldErrors: { currentPassword: "Senha atual incorreta." },
      };
    }
    if (error.status === 400 && /diferente da atual/i.test(error.message)) {
      return {
        ok: false,
        fieldErrors: {
          password: "A nova senha precisa ser diferente da atual.",
        },
      };
    }
    if (error.status === 429) {
      return {
        ok: false,
        fieldErrors: {},
        message: "Muitas tentativas. Aguarde um minuto e tente de novo.",
      };
    }
    return { ok: false, fieldErrors: {}, message: error.message };
  }

  try {
    const clientIp = clientIpFrom((await headers()).get(FORWARDED_FOR_HEADER));
    await setSession(await authService.login(email, values.password, clientIp));
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    // A senha foi trocada; só não deu para continuar entrado.
    await clearSession();
    redirect("/login?expired=1");
  }
  return { ok: true };
}
