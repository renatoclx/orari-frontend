"use client";

import { useState } from "react";
import { BellOff, BellRing, Share } from "lucide-react";
import {
  appProPreferencesAction,
  appProPushSubscribeAction,
  appProPushUnsubscribeAction,
} from "@/app/app/notification-actions";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import {
  usePushDevice,
  type PushActions,
} from "@/components/client-app/usePushDevice";
import {
  CATEGORY_HINT,
  CATEGORY_LABEL,
} from "@/components/notifications/notification-format";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { NotificationPreference } from "@/types/notification";

// As ações do profissional (módulo, para a identidade ser estável no hook).
const PRO_ACTIONS: PushActions = {
  subscribe: appProPushSubscribeAction,
  unsubscribe: appProPushUnsubscribeAction,
};

/**
 * Avisos → o aparelho e o que vira push (screens/app-profissional.md): ativar e
 * desativar neste aparelho e um interruptor por categoria. A caixa recebe tudo;
 * só o push tem interruptor.
 */
export function ProfessionalPushCard({
  publicKey,
  preferences,
}: {
  /** Nula com o push desligado no servidor. */
  publicKey: string | null;
  preferences: NotificationPreference[];
}) {
  // Sem a chave, o push está desligado no servidor: o card só explica.
  if (!publicKey) {
    return (
      <section className="space-y-2 rounded-card border border-border bg-card p-4">
        <h2 className="font-semibold">Avisos neste aparelho</h2>
        <p className="text-sm text-muted-foreground">
          Os avisos no celular não estão disponíveis no momento. As notificações
          continuam chegando aqui no app.
        </p>
      </section>
    );
  }
  return <Device publicKey={publicKey} preferences={preferences} />;
}

function Device({
  publicKey,
  preferences,
}: {
  publicKey: string;
  preferences: NotificationPreference[];
}) {
  const { situation, ios, busy, error, enable, disable } = usePushDevice(
    publicKey,
    PRO_ACTIONS,
  );
  const [prefs, setPrefs] = useState(preferences);
  const [prefsError, setPrefsError] = useState<string>();

  function change(category: NotificationPreference["category"], push: boolean) {
    const previous = prefs;
    const next = prefs.map((item) =>
      item.category === category ? { ...item, push } : item,
    );
    // Muda na hora e desfaz se a API recusar.
    setPrefs(next);
    setPrefsError(undefined);
    void appProPreferencesAction(next).then((result) => {
      if (!result.ok) {
        setPrefs(previous);
        setPrefsError(result.message);
      }
    });
  }

  return (
    <section
      aria-labelledby="pro-push"
      className="space-y-4 rounded-card border border-border bg-card p-4"
    >
      <h2 id="pro-push" className="font-semibold">
        Avisos neste aparelho
      </h2>

      {situation === null && (
        <p className="text-sm text-muted-foreground">Conferindo o aparelho…</p>
      )}

      {situation === "install-ios" && (
        <div className="space-y-2 text-sm">
          <p>
            No iPhone, os avisos chegam pelo app instalado na tela de início.
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
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
            Receba um aviso quando um cliente marcar ou cancelar um horário seu,
            mesmo com o app fechado.
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
      )}

      {error && <AppFormMessage>{error}</AppFormMessage>}

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Tudo chega à caixa de notificações. Aqui você escolhe o que também
          vira aviso no celular.
        </p>
        {prefs.map(({ category, push }) => (
          <label
            key={category}
            className="flex items-center justify-between gap-4"
          >
            <span className="space-y-0.5">
              <span className="block font-medium">
                {CATEGORY_LABEL[category]}
              </span>
              <span className="block text-sm text-muted-foreground">
                {CATEGORY_HINT[category]}
              </span>
            </span>
            <Switch
              checked={push}
              onCheckedChange={(next) => change(category, next)}
            />
          </label>
        ))}
        {prefsError && <AppFormMessage>{prefsError}</AppFormMessage>}
      </div>
    </section>
  );
}
