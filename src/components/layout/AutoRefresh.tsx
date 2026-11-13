"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Renderiza de novo a tela atual no servidor a cada `everyMs`, para mostrar o
 * que outras pessoas fizeram (ex.: agendamentos feitos pelo celular). Não mexe
 * no que está aberto (filtros, rolagem), mas pula a rodada com um diálogo
 * aberto, para não trocar os dados debaixo de quem está digitando; aba
 * escondida também não atualiza.
 */
export function AutoRefresh({ everyMs = 60_000 }: { everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (document.querySelector('[role="dialog"]')) return;
      router.refresh();
    }, everyMs);
    return () => clearInterval(timer);
  }, [router, everyMs]);
  return null;
}
