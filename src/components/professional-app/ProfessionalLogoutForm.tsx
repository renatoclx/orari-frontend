"use client";

import { useRef } from "react";
import { appLogoutAction } from "@/app/app/actions";
import { appProPushUnsubscribeAction } from "@/app/app/notification-actions";

// O service worker do app cuida do escopo /app/ (ver usePushDevice).
const SW_SCOPE = "/app/";
// Sair não espera mais que isso pela limpeza do aviso.
const CLEANUP_LIMIT_MS = 3000;

// Apaga na API o aviso deste aparelho: quem entrar depois nele não pode receber
// o que é desta conta. O aparelho continua com a inscrição; ela só volta a valer
// para quem ativar os avisos de novo.
async function forgetDevice(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) await appProPushUnsubscribeAction(subscription.endpoint);
}

/**
 * O formulário de Sair do profissional: limpa o aviso do aparelho (sem
 * travar se falhar) e só então sai.
 */
export function ProfessionalLogoutForm({
  children,
}: {
  children: React.ReactNode;
}) {
  const ready = useRef(false);
  return (
    <form
      action={appLogoutAction}
      onSubmit={async (event) => {
        if (ready.current) return;
        event.preventDefault();
        const form = event.currentTarget;
        await Promise.race([
          forgetDevice().catch(() => undefined),
          new Promise((resolve) => setTimeout(resolve, CLEANUP_LIMIT_MS)),
        ]);
        ready.current = true;
        form.requestSubmit();
      }}
    >
      {children}
    </form>
  );
}
