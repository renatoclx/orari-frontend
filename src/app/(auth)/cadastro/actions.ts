"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  toSignupInput,
  validateSignup,
  type SignupErrors,
  type SignupValues,
} from "@/components/auth/signup-validation";
import { FORWARDED_FOR_HEADER, clientIpFrom } from "@/lib/client-ip";
import { ApiError } from "@/services/api";
import * as authService from "@/services/auth.service";
import { setSession } from "@/services/session";

/** Falha do cadastro: o erro de um campo (ex.: e-mail já usado) ou um geral. */
export type SignupResult = { fieldErrors: SignupErrors; message?: string };

/**
 * Valida de novo no servidor e cria a empresa na API. Com sucesso, grava a
 * sessão e entra no sistema com os primeiros passos abertos.
 */
export async function signupAction(
  values: SignupValues,
): Promise<SignupResult> {
  const fieldErrors = validateSignup(values);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // O Caddy coloca o IP do usuário no x-forwarded-for: o limite vale por pessoa.
  const clientIp = clientIpFrom((await headers()).get(FORWARDED_FOR_HEADER));

  try {
    const tokens = await authService.signup(toSignupInput(values), clientIp);
    await setSession(tokens);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return signupFailure(error);
  }

  // Fora do try: o redirect() funciona lançando um erro especial do Next.
  // Boas-vindas e os primeiros passos já abertos no Dashboard.
  redirect("/dashboard?loggedIn=novo&passos=1");
}

function signupFailure(error: ApiError): SignupResult {
  // 409 com o campo (e-mail ou documento já usados): a mensagem vai nele.
  const body = error.body as { field?: string } | undefined;
  if (
    error.status === 409 &&
    (body?.field === "email" || body?.field === "document")
  ) {
    return { fieldErrors: { [body.field]: error.message } };
  }
  if (error.status === 429) {
    return {
      fieldErrors: {},
      message:
        "Muitos cadastros a partir desta conexão. Tente de novo mais tarde.",
    };
  }
  return { fieldErrors: {}, message: error.message };
}
