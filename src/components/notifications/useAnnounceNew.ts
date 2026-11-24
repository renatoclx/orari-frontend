"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/** O que o aviso na tela precisa saber de uma notificação (painel, app do profissional e do cliente). */
export type Announceable = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type Options<T extends Announceable> = {
  /** Quando chegou a notificação mais nova (de `useUnreadCount`). */
  latestAt: string | null | undefined;
  /** As últimas notificações; nulo se a API não respondeu. */
  fetchRecent: () => Promise<T[] | null>;
  /** "Abrir" no aviso: marca como lida e leva ao destino. */
  onOpen: (item: T) => void;
  /** "Ver todas", quando chegam mais de 3 de uma vez. */
  onSeeAll: () => void;
  /** Chegou algo novo (lida ou não): quem usa pode atualizar a tela. */
  onNew?: (items: T[]) => void;
};

/** Quantos avisos aparecem de uma vez; o resto vira um aviso só. */
const MAX_TOASTS = 3;

/**
 * Mostra no toaster a notificação que chega com a tela aberta, além de contar
 * no sino. A primeira resposta só fixa o ponto de partida: o que já estava lá
 * não vira aviso. Quem compara é a data da mais nova, e não o número: ler uma e
 * chegar outra no mesmo intervalo também conta.
 */
export function useAnnounceNew<T extends Announceable>(options: Options<T>) {
  const { latestAt } = options;
  // A versão mais recente das funções, sem refazer o efeito a cada render.
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });
  // A notificação mais nova que a tela já viu (indefinida até a primeira resposta).
  const seenRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (latestAt === undefined) return;
    const seen = seenRef.current;
    seenRef.current = latestAt;
    if (seen === undefined || latestAt === null) return;
    if (seen !== null && latestAt <= seen) return;

    void (async () => {
      const { fetchRecent, onOpen, onSeeAll, onNew } = latest.current;
      const items = await fetchRecent();
      if (!items) return;
      const added = items.filter(
        (item) => seen === null || item.createdAt > seen,
      );
      if (added.length > 0) onNew?.(added);
      const fresh = added.filter((item) => item.readAt === null);
      for (const item of fresh.slice(0, MAX_TOASTS)) {
        toast.info(item.title, {
          description: item.body,
          duration: 10_000,
          action: { label: "Abrir", onClick: () => onOpen(item) },
        });
      }
      // Muitas de uma vez: um aviso só para o resto, em vez de uma pilha.
      if (fresh.length > MAX_TOASTS) {
        toast.info(`Mais ${fresh.length - MAX_TOASTS} notificações novas`, {
          action: { label: "Ver todas", onClick: onSeeAll },
        });
      }
    })();
  }, [latestAt]);
}
