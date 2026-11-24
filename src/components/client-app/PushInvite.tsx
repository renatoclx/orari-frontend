"use client";

import { toast } from "sonner";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BellRing, X } from "lucide-react";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { usePushDevice } from "@/components/client-app/usePushDevice";
import { Button } from "@/components/ui/button";

// "Agora não" vale para este aparelho (é só uma conveniência: sem o
// armazenamento do navegador, o convite volta a aparecer).
const DISMISS_KEY = "orari-app:push-invite-dismissed";

// O valor não muda sozinho: não há o que assinar.
const noSubscribe = () => () => {};

const readDismissed = () => {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Convite do Início (screens/app-cliente.md, "Avisos"): aparece enquanto os
 * avisos não estão ativados neste aparelho. No iPhone pelo Safari, leva ao
 * passo a passo de instalar (Menu → Avisos).
 */
export function PushInvite({ publicKey }: { publicKey: string }) {
  const { situation, busy, error, enable } = usePushDevice(publicKey);
  // No servidor conta como fechado: ele não sabe o que o aparelho guardou, e o
  // convite só aparece depois de montar (sem divergir na hidratação).
  const stored = useSyncExternalStore(noSubscribe, readDismissed, () => true);
  const [closed, setClosed] = useState(false);
  const [enabled, setEnabled] = useState(false);

  function dismiss() {
    setClosed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Sem armazenamento: some só nesta visita.
    }
  }

  // Ativado: o convite some e o toaster do rodapé confirma.
  if (enabled) return null;
  if (stored || closed) return null;
  if (situation !== "off" && situation !== "install-ios") return null;

  return (
    <section
      aria-labelledby="push-invite"
      className="relative space-y-3 rounded-card border border-primary/40 bg-primary/10 p-4"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar o convite"
        className="absolute top-2 right-2 grid size-10 place-items-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <BellRing
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="space-y-0.5">
          <h2 id="push-invite" className="font-semibold">
            Receba lembretes dos seus horários
          </h2>
          <p className="text-sm text-muted-foreground">
            {situation === "install-ios"
              ? "No iPhone, os avisos chegam pelo app instalado na tela de início."
              : "Ative os avisos e saiba antes de cada agendamento."}
          </p>
        </div>
      </div>
      {situation === "install-ios" ? (
        <Button asChild className="h-11 w-full">
          <Link href="/app/menu/avisos">Ver como instalar</Link>
        </Button>
      ) : (
        <Button
          type="button"
          disabled={busy}
          onClick={() =>
            void enable().then((ok) => {
              if (!ok) return;
              toast.info(
                "Avisos ativados. Você vai receber os lembretes dos seus horários.",
              );
              setEnabled(true);
            })
          }
          className="h-11 w-full"
        >
          {busy ? "Ativando…" : "Ativar avisos"}
        </Button>
      )}
      {error && <AppFormMessage>{error}</AppFormMessage>}
    </section>
  );
}
