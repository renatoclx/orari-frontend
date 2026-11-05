"use client";

import { useState, useTransition } from "react";
import { BellOff, BellRing, Send, Share } from "lucide-react";
import { appPushPreferencesAction, appPushTestAction } from "@/app/app/actions";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { testResultMessage } from "@/components/client-app/push-support";
import { usePushDevice } from "@/components/client-app/usePushDevice";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { PushPreferences } from "@/types/client-app";

type PushDeviceCardProps = {
  publicKey: string;
  preferences: PushPreferences;
};

const cardClass = "space-y-4 rounded-card border border-border bg-card p-4";

/** Passo a passo de instalar no iPhone: só o app instalado recebe avisos. */
function InstallSteps() {
  return (
    <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
      <li>
        No Safari, toque em Compartilhar{" "}
        <Share
          className="inline size-4 align-text-bottom"
          aria-label="(o quadrado com a seta)"
        />
        .
      </li>
      <li>Escolha Adicionar à Tela de Início.</li>
      <li>Abra o Orari pelo ícone e ative os avisos aqui.</li>
    </ol>
  );
}

/**
 * Menu → Avisos, bloco do aparelho (screens/app-cliente.md, "Avisos"): ativar,
 * desativar e testar neste aparelho, e os dois interruptores da conta.
 */
export function PushDeviceCard({
  publicKey,
  preferences,
}: PushDeviceCardProps) {
  const { situation, ios, busy, error, enable, disable } =
    usePushDevice(publicKey);
  const [prefs, setPrefs] = useState(preferences);
  const [prefsError, setPrefsError] = useState<string>();
  const [testMessage, setTestMessage] = useState<string>();
  const [testing, startTest] = useTransition();

  function changePreference(patch: Partial<PushPreferences>) {
    const previous = prefs;
    const next = { ...prefs, ...patch };
    // Muda na hora e desfaz se a API recusar.
    setPrefs(next);
    setPrefsError(undefined);
    void appPushPreferencesAction(next).then((result) => {
      if (!result.ok) {
        setPrefs(previous);
        setPrefsError(result.message);
      }
    });
  }

  function sendTest() {
    setTestMessage(undefined);
    startTest(async () => {
      const result = await appPushTestAction();
      setTestMessage(
        result.ok ? testResultMessage(result.devices) : result.message,
      );
    });
  }

  return (
    <section aria-labelledby="push-device" className={cardClass}>
      <h2 id="push-device" className="font-semibold">
        Avisos neste aparelho
      </h2>

      {situation === null && (
        <p className="text-sm text-muted-foreground">Conferindo o aparelho…</p>
      )}

      {situation === "install-ios" && (
        <div className="space-y-2">
          <p className="text-sm">
            No iPhone, os avisos chegam pelo app instalado na tela de início.
          </p>
          <InstallSteps />
        </div>
      )}

      {situation === "unsupported" && (
        <p className="text-sm text-muted-foreground">
          Este navegador não recebe avisos. No Android, use o Chrome; no iPhone,
          instale o app (iOS 16.4 ou mais novo).
        </p>
      )}

      {situation === "denied" && (
        <div className="flex items-start gap-3 text-sm">
          <BellOff
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <p>
            Os avisos estão bloqueados neste aparelho.{" "}
            {ios
              ? "Para liberar, abra Ajustes → Notificações → Orari e ligue Permitir Notificações."
              : "Para liberar, abra as configurações do aparelho → Notificações → Orari (ou toque no cadeado ao lado do endereço, no Chrome) e permita."}
          </p>
        </div>
      )}

      {situation === "off" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Receba lembretes dos seus horários e as novidades dos seus
            estabelecimentos, mesmo com o app fechado.
          </p>
          <Button
            type="button"
            onClick={() => void enable()}
            disabled={busy}
            className="h-12 w-full text-base"
          >
            <BellRing aria-hidden="true" />
            {busy ? "Ativando…" : "Ativar avisos"}
          </Button>
        </div>
      )}

      {situation === "on" && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm">
            <BellRing className="size-5 text-primary" aria-hidden="true" />
            Ativados neste aparelho.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={sendTest}
              disabled={testing}
              className="h-11"
            >
              <Send aria-hidden="true" />
              {testing ? "Enviando…" : "Testar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void disable()}
              disabled={busy}
              className="h-11"
            >
              <BellOff aria-hidden="true" />
              Desativar
            </Button>
          </div>
          {testMessage && (
            <AppFormMessage tone="info">{testMessage}</AppFormMessage>
          )}
        </div>
      )}

      {error && <AppFormMessage>{error}</AppFormMessage>}

      <div className="space-y-4 border-t border-border pt-4">
        <label className="flex items-center justify-between gap-4">
          <span className="space-y-0.5">
            <span className="block font-medium">Lembretes e agendamentos</span>
            <span className="block text-sm text-muted-foreground">
              Antes do horário e quando a clínica marca, muda ou cancela
            </span>
          </span>
          <Switch
            checked={prefs.notifyAppointments}
            onCheckedChange={(notifyAppointments) =>
              changePreference({ notifyAppointments })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="space-y-0.5">
            <span className="block font-medium">Novidades e promoções</span>
            <span className="block text-sm text-muted-foreground">
              Aniversário e mensagens dos estabelecimentos
            </span>
          </span>
          <Switch
            checked={prefs.notifyPromotions}
            onCheckedChange={(notifyPromotions) =>
              changePreference({ notifyPromotions })
            }
          />
        </label>
        {prefsError && <AppFormMessage>{prefsError}</AppFormMessage>}
      </div>
    </section>
  );
}
