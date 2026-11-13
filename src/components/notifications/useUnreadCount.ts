"use client";

import { useCallback, useEffect, useState } from "react";
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
 * O número do sino. Confere ao montar, a cada minuto e ao voltar para a aba
 * (quem deixou o painel aberto de manhã vê o número certo ao voltar). Aba
 * escondida não consulta: ninguém está olhando. `fetchCount` devolve nulo
 * quando a API não respondeu e o número anterior fica.
 */
export function useUnreadCount(
  fetchCount: () => Promise<number | null>,
  initial = 0,
) {
  const [count, setCount] = useState(initial);

  const refresh = useCallback(async () => {
    const next = await fetchCount();
    if (next !== null) setCount(next);
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

  return { count, setCount, refresh };
}
