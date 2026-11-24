"use client";

import { useCallback, useEffect, useState } from "react";
import type { UnreadInfo } from "@/types/notification";
import { POLL_MS } from "./notification-format";

const CHANGED_EVENT = "orari:notifications-changed";

/**
 * Avisa o sino de que algo foi lido ou marcado em outro lugar da tela (a página
 * de notificações), para ele conferir o número já, sem esperar o minuto.
 */
export function announceNotificationsChanged(): void {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/**
 * O número do sino. Confere ao montar, a cada 30 segundos e ao voltar para a aba
 * (quem deixou o painel aberto de manhã vê o número certo ao voltar). Aba
 * escondida não consulta: ninguém está olhando. `fetchCount` devolve nulo
 * quando a API não respondeu e o número anterior fica. `latestAt` é quando
 * chegou a notificação mais nova (nulo sem nenhuma; indefinido antes da
 * primeira resposta): quem quiser avisar na tela compara com a que já viu.
 */
export function useUnreadCount(
  fetchCount: () => Promise<UnreadInfo | null>,
  initial = 0,
) {
  const [count, setCount] = useState(initial);
  const [latestAt, setLatestAt] = useState<string | null | undefined>(
    undefined,
  );

  const refresh = useCallback(async () => {
    const next = await fetchCount();
    if (next === null) return;
    setCount(next.unread);
    setLatestAt(next.latestAt);
  }, [fetchCount]);

  useEffect(() => {
    const check = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    check();
    const timer = setInterval(check, POLL_MS);
    document.addEventListener("visibilitychange", check);
    // Lido na página de notificações: confere já.
    const onChanged = () => void refresh();
    window.addEventListener(CHANGED_EVENT, onChanged);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener(CHANGED_EVENT, onChanged);
    };
  }, [refresh]);

  return { count, latestAt, setCount, refresh };
}
