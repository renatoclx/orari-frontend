"use server";

import { headers } from "next/headers";
import { validatePassword } from "@/components/users/user-validation";
import { FORWARDED_FOR_HEADER, clientIpFrom } from "@/lib/client-ip";
import { ApiError } from "@/services/api";
import * as authService from "@/services/auth.service";

export type ResetPasswordResult =
  | { ok: true; professional: boolean }
  | {
      ok: false;
      fieldErrors: { password?: string; passwordConfirmation?: string };
      /** Link usado, vencido ou desconhecido: a tela oferece pedir outro. */
      linkInvalid?: boolean;
      message?: string;
    };

/**
 * Senha nova com o link do e-mail (screens/login.md). Valida de novo no
 * servidor; a API troca a senha e encerra todas as sessões da pessoa.
 */
export async function resetPasswordAction(input: {
  token: string;
  password: string;
  passwordConfirmation: string;
}): Promise<ResetPasswordResult> {
  const fieldErrors = validatePassword(
    input.password,
    input.passwordConfirmation,
  );
  if (fieldErrors.password || fieldErrors.passwordConfirmation) {
    return { ok: false, fieldErrors };
  }
  const clientIp = clientIpFrom((await headers()).get(FORWARDED_FOR_HEADER));
  try {
    const { professional } = await authService.resetPassword(
      {
        token: input.token,
        newPassword: input.password,
        newPasswordConfirmation: input.passwordConfirmation,
      },
      clientIp,
    );
    return { ok: true, professional };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 400 && /link/i.test(error.message)) {
      return {
        ok: false,
        fieldErrors: {},
        linkInvalid: true,
        message: error.message,
      };
    }
    if (error.status === 429) {
      return {
        ok: false,
        fieldErrors: {},
        message:
          "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
      };
    }
    return { ok: false, fieldErrors: {}, message: error.message };
  }
}
