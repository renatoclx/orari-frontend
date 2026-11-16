"use client";

import { useEffect } from "react";

// O evento que o Chrome (Android) entrega quando o app pode ser instalado. Não
// está nos tipos do TypeScript (não é padrão).
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Guardado fora do React: o evento chega uma vez só, em qualquer tela do app, e o
// convite do Início precisa encontrá-lo depois.
let stored: BeforeInstallPromptEvent | null = null;
let listening = false;
const subscribers = new Set<() => void>();

const notify = () => subscribers.forEach((callback) => callback());

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    // Sem isto o Chrome mostra o aviso dele; aqui o convite é do Orari.
    event.preventDefault();
    stored = event as BeforeInstallPromptEvent;
    notify();
  });
  // Instalou (por aqui ou pelo menu do navegador): o evento não vale mais.
  window.addEventListener("appinstalled", () => {
    stored = null;
    notify();
  });
}

/**
 * Fica no layout do app: começa a ouvir o `beforeinstallprompt` assim que o app
 * abre, em qualquer tela, para não perder o evento antes do Início.
 */
export function InstallPromptListener() {
  useEffect(listen, []);
  return null;
}

export function subscribeInstallPrompt(callback: () => void): () => void {
  listen();
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export const hasInstallPromptEvent = () => stored !== null;

/**
 * Abre a janela de instalar do navegador. O evento só vale uma vez: sai da
 * guarda já na chamada, seja qual for a resposta. Devolve a escolha do cliente,
 * ou nulo se não havia evento.
 */
export async function promptInstall(): Promise<
  "accepted" | "dismissed" | null
> {
  const event = stored;
  if (!event) return null;
  stored = null;
  notify();
  try {
    await event.prompt();
    return (await event.userChoice).outcome;
  } catch {
    return null;
  }
}
