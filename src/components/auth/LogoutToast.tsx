"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mostrado na tela de login depois de sair (/login?loggedOut=1).
export function LogoutToast() {
  const router = useRouter();

  useEffect(() => {
    // O id evita toast duplicado (o React roda efeitos duas vezes em dev).
    toast.success("Até logo!", {
      id: "logout",
      description: "Você saiu da sua conta.",
    });
    // Limpa a URL para o toast não voltar ao recarregar a página.
    router.replace("/login");
  }, [router]);

  return null;
}
