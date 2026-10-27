"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  searchClientsAction,
  type ClientOption,
} from "@/app/(admin)/appointment-actions";

/**
 * Busca de clientes no servidor para um Combobox (a lista inicial traz os
 * primeiros). Mantém o cliente escolhido na lista mesmo que a busca o tire.
 */
export function useClientSearch(
  initial: ClientOption[],
  pickedId: string,
  /** Cliente já escolhido ao abrir (ex.: o da URL), que pode estar fora dos primeiros. */
  initialPicked?: ClientOption,
) {
  const [options, setOptions] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<ClientOption | undefined>(initialPicked);
  const request = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(debounce.current), []);

  function search(term: string) {
    clearTimeout(debounce.current);
    if (!term.trim()) {
      setOptions(initial);
      return;
    }
    debounce.current = setTimeout(async () => {
      const current = ++request.current;
      setLoading(true);
      const result = await searchClientsAction(term);
      if (current !== request.current) return;
      setLoading(false);
      if (result.ok) setOptions(result.clients);
      else toast.error("Não foi possível buscar os clientes.");
    }, 300);
  }

  const list = [...options];
  if (
    picked &&
    picked.id === pickedId &&
    !list.some((c) => c.id === picked.id)
  ) {
    list.unshift(picked);
  }

  return {
    options: list,
    loading,
    search,
    /** Guarda o cliente escolhido (para não sumir da lista). */
    pick: (id: string) => setPicked(list.find((c) => c.id === id)),
  };
}
