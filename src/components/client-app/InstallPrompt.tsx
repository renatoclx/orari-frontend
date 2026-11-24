"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { InstallIosSheet } from "@/components/client-app/InstallIosSheet";
import {
  hasInstallPromptEvent,
  promptInstall,
  subscribeInstallPrompt,
} from "@/components/client-app/install-prompt-store";
import {
  dismissedRecently,
  installMode,
  isIosSafari,
} from "@/components/client-app/install-prompt";
import { isStandalone } from "@/components/client-app/standalone";
import { isIosDevice } from "@/components/client-app/push-support";
import { Button } from "@/components/ui/button";

// O fechamento vale para este aparelho (é só uma conveniência: sem o
// armazenamento do navegador, o convite volta a aparecer).
const DISMISS_KEY = "orari-app:install-dismissed-at";

function readDismissedAt(): number | null {
  try {
    const value = Number(window.localStorage.getItem(DISMISS_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function saveDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Sem armazenamento: some só nesta visita.
  }
}

type Mode = "android" | "ios-safari" | "ios-other" | "none";

// O que mostrar agora, lido do aparelho. Devolve um texto, e não um objeto, para
// o React comparar por valor e não refazer a tela sem necessidade.
function readMode(): Mode {
  if (dismissedRecently(readDismissedAt(), Date.now())) return "none";
  const ios = isIosDevice(navigator.userAgent, navigator.maxTouchPoints);
  const mode = installMode({
    ios,
    standalone: isStandalone(),
    hasPromptEvent: hasInstallPromptEvent(),
  });
  if (mode === "ios") {
    return isIosSafari(navigator.userAgent) ? "ios-safari" : "ios-other";
  }
  return mode ?? "none";
}

/**
 * Convite do Início para instalar o app (screens/app-cliente.md, "Instalar no
 * celular"). No Android, o botão abre a janela de instalar do navegador; no
 * iPhone, abre as instruções (o iPhone não tem botão de instalar). Some quando o
 * app já está instalado (aberto pelo ícone) e fica quieto por alguns dias depois
 * de fechado. No servidor conta como "nenhum": só aparece depois de montar.
 */
export function InstallPrompt() {
  const mode = useSyncExternalStore(
    subscribeInstallPrompt,
    readMode,
    (): Mode => "none",
  );
  const [closed, setClosed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  if (mode === "none" || closed) return null;
  const ios = mode !== "android";

  function dismiss() {
    saveDismissed();
    setClosed(true);
  }

  async function install() {
    const outcome = await promptInstall();
    // Recusou na janela do navegador: o convite descansa uns dias.
    if (outcome === "dismissed") dismiss();
  }

  return (
    <>
      <section
        aria-labelledby="install-title"
        className="relative space-y-3 rounded-card border border-primary/40 bg-primary/10 p-4"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar o convite de instalar"
          className="absolute top-2 right-2 grid size-10 place-items-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <div className="flex items-start gap-3 pr-8">
          <Smartphone
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <h2 id="install-title" className="font-semibold">
              Instale o Orari no celular
            </h2>
            <p className="text-sm text-muted-foreground">
              Abra direto da tela de início, em tela cheia, sem digitar o
              endereço.
            </p>
          </div>
        </div>
        {ios ? (
          <Button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="h-12 w-full text-base"
          >
            <Download aria-hidden="true" />
            Como instalar
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => void install()}
            className="h-12 w-full text-base"
          >
            <Download aria-hidden="true" />
            Instalar
          </Button>
        )}
      </section>
      {sheetOpen && (
        <InstallIosSheet safari={mode === "ios-safari"} onClose={closeSheet} />
      )}
    </>
  );
}
