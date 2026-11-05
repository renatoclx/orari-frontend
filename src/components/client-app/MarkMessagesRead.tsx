"use client";

import { useEffect } from "react";
import { appMarkMessagesReadAction } from "@/app/app/actions";

/**
 * Marca os avisos como lidos depois que a tela Avisos aparece. Fica no
 * navegador, e não na montagem do servidor, para um carregamento antecipado da
 * página (prefetch) não marcar como lido o que o cliente ainda não viu.
 */
export function MarkMessagesRead() {
  useEffect(() => {
    void appMarkMessagesReadAction();
  }, []);
  return null;
}
