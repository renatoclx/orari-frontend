"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { OnboardingDialog } from "./OnboardingDialog";

/**
 * Abre os primeiros passos quando a URL traz `?passos=1` (o destino da
 * notificação de boas-vindas) e tira o parâmetro ao fechar, para recarregar a
 * página não abrir de novo. Só o ADMIN monta este componente.
 */
export function OnboardingDialogHost() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // Fechado à mão: o parâmetro ainda está na URL até o replace terminar.
  const [closed, setClosed] = useState(false);
  const wanted = params.get("passos") === "1";

  function onOpenChange(open: boolean) {
    if (open) return;
    setClosed(true);
    const next = new URLSearchParams(params.toString());
    next.delete("passos");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  // Uma nova notificação leva de volta a ?passos=1: volta a abrir.
  if (!wanted && closed) setClosed(false);

  return (
    <OnboardingDialog open={wanted && !closed} onOpenChange={onOpenChange} />
  );
}
