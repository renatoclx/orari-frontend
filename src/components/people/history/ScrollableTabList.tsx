"use client";

import { useEffect, useRef } from "react";

/**
 * Lista das abas, com rolagem lateral no celular. Ao abrir (ou trocar de aba),
 * rola só a lista, sem mexer na página, até a aba ativa ficar à vista.
 */
export function ScrollableTabList({
  activeKey,
  className,
  children,
}: {
  /** Muda quando a aba ativa muda, para rolar de novo. */
  activeKey: string;
  className?: string;
  children: React.ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !active) return;
    const offset =
      active.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollLeft += offset - (list.clientWidth - active.offsetWidth) / 2;
  }, [activeKey]);

  return (
    <ul ref={listRef} data-scroll-x className={className}>
      {children}
    </ul>
  );
}
