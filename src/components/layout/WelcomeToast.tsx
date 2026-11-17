"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type WelcomeToastProps = {
  userName: string;
};

// Mostrado ao entrar (?loggedIn=1) ou logo depois do cadastro sozinho
// (?loggedIn=novo). Lê a URL no navegador porque layouts não recebem
// searchParams; assim funciona em qualquer tela da área administrativa.
export function WelcomeToast({ userName }: WelcomeToastProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const welcome = searchParams.get("loggedIn");
  const justLoggedIn = welcome !== null;

  useEffect(() => {
    if (!justLoggedIn) return;

    const firstName = userName.split(" ")[0];
    // O id evita toast duplicado (o React roda efeitos duas vezes em dev).
    toast.success(`Olá, ${firstName}!`, {
      id: "welcome",
      description:
        welcome === "novo"
          ? "Sua conta está pronta: o teste grátis de 7 dias começou."
          : "Que bom ter você de volta.",
    });
    // Tira só o loggedIn (o toast não volta ao recarregar); os demais
    // parâmetros ficam (ex.: ?passos=1 abre os primeiros passos).
    const next = new URLSearchParams(searchParams.toString());
    next.delete("loggedIn");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [justLoggedIn, welcome, searchParams, userName, router, pathname]);

  return null;
}
