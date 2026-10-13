"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type AuthNotice = "loggedOut" | "expired";

type AuthNoticeToastProps = {
  notice: AuthNotice;
};

// Avisos mostrados na tela de login depois de um redirecionamento:
// /login?loggedOut=1 (saiu) ou /login?expired=1 (sessão recusada pela API).
export function AuthNoticeToast({ notice }: AuthNoticeToastProps) {
  const router = useRouter();

  useEffect(() => {
    // O id evita toast duplicado (o React roda efeitos duas vezes em dev).
    if (notice === "loggedOut") {
      toast.success("Até logo!", {
        id: notice,
        description: "Você saiu da sua conta.",
      });
    } else {
      toast.info("Sua sessão expirou.", {
        id: notice,
        description: "Entre novamente para continuar.",
      });
    }
    // Limpa a URL para o toast não voltar ao recarregar a página.
    router.replace("/login");
  }, [notice, router]);

  return null;
}
