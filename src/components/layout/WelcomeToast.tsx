"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type WelcomeToastProps = {
  userName: string;
};

// Mostrado ao entrar (?loggedIn=1). Lê a URL no navegador porque layouts não
// recebem searchParams; assim funciona em qualquer tela da área administrativa.
export function WelcomeToast({ userName }: WelcomeToastProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const justLoggedIn = searchParams.has("loggedIn");

  useEffect(() => {
    if (!justLoggedIn) return;

    const firstName = userName.split(" ")[0];
    // O id evita toast duplicado (o React roda efeitos duas vezes em dev).
    toast.success(`Olá, ${firstName}!`, {
      id: "welcome",
      description: "Que bom ter você de volta.",
    });
    // Limpa a URL para o toast não voltar ao recarregar a página.
    router.replace(pathname);
  }, [justLoggedIn, userName, router, pathname]);

  return null;
}
