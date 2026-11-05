import type { Metadata } from "next";
import Link from "next/link";
import { AccessLinkForm } from "@/components/client-app/AccessLinkForm";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { PlaceAvatar } from "@/components/client-app/PlaceAvatar";
import { accessLinkMode, firstName } from "@/components/client-app/client-app";
import { ApiError } from "@/services/api";
import { checkAccessLink } from "@/services/app-account.service";
import { getAppToken } from "@/services/app-session";
import type { AccessLinkCheck } from "@/types/client-app";

export const metadata: Metadata = { title: "Acesso" };

// Texto de cada caso do link (screens/app-cliente.md).
const INTRO = {
  attach: "Adicione este estabelecimento à sua conta.",
  create:
    "Crie uma senha para entrar no app. Depois, é só usar o telefone e a senha.",
  reset: "Você já tem conta no app. Crie uma senha nova para ela.",
} as const;

/**
 * Link de acesso que o estabelecimento manda (QR code ou WhatsApp). Confere o
 * link sem usá-lo; só o envio do formulário o usa (uma vez só).
 */
export default async function AccessLinkPage({
  params,
}: PageProps<"/app/acesso/[token]">) {
  const { token } = await params;
  let check: AccessLinkCheck;
  try {
    check = await checkAccessLink(token);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Link de acesso</h1>
        <AppFormMessage>{error.message}</AppFormMessage>
        <Link
          href="/app/entrar"
          className="text-center text-sm font-semibold text-primary hover:underline"
        >
          Já tenho conta: entrar
        </Link>
      </div>
    );
  }

  const mode = accessLinkMode(Boolean(await getAppToken()), check.hasAccount);
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <PlaceAvatar
          name={check.place.name}
          logoUrl={check.place.logoUrl}
          size="lg"
        />
        <p className="text-sm text-muted-foreground">{check.place.name}</p>
        <h1 className="text-2xl font-semibold">
          Olá, {firstName(check.clientName)}
        </h1>
        <p className="text-sm text-muted-foreground">{INTRO[mode]}</p>
      </div>
      <AccessLinkForm
        token={token}
        mode={mode}
        needsPhone={check.needsPhone}
        placeName={check.place.name}
      />
    </div>
  );
}
