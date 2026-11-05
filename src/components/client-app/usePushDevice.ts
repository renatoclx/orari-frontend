"use client";

import { useCallback, useEffect, useState } from "react";
import {
  appPushSubscribeAction,
  appPushUnsubscribeAction,
} from "@/app/app/actions";
import {
  isIosDevice,
  pushSituation,
  urlBase64ToUint8Array,
  type PushSituation,
} from "@/components/client-app/push-support";
import type { PushSubscriptionJson } from "@/types/client-app";

// O service worker mora em /app-assets/ e cuida só do app (ver next.config.ts).
const SW_URL = "/app-assets/sw.js";
const SW_SCOPE = "/app/";

const isSupported = () =>
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // Safari do iPhone antigo: a marca própria dele.
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  return registration ? registration.pushManager.getSubscription() : null;
}

/**
 * Os avisos neste aparelho: a situação (ver `pushSituation`), ativar e
 * desativar. `situation` é nula até ler o navegador, depois de montar (o
 * servidor não sabe nada do aparelho e o HTML tem que bater na hidratação).
 */
export function usePushDevice(publicKey: string) {
  const [situation, setSituation] = useState<PushSituation | null>(null);
  const [ios, setIos] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    const read = async () => {
      const supported = isSupported();
      const subscription = supported ? await currentSubscription() : null;
      const permission = supported ? Notification.permission : "default";
      // Já ativado neste aparelho: manda a inscrição de novo. Ao sair do app a
      // API apaga a inscrição, mas o celular continua com ela; assim quem entra
      // de novo volta a receber sem precisar ativar outra vez.
      if (subscription && permission === "granted") {
        void appPushSubscribeAction(
          subscription.toJSON() as PushSubscriptionJson,
        );
      }
      if (!active) return;
      const onIos = isIosDevice(navigator.userAgent, navigator.maxTouchPoints);
      setIos(onIos);
      setSituation(
        pushSituation({
          supported,
          ios: onIos,
          standalone: isStandalone(),
          permission,
          subscribed: subscription !== null,
        }),
      );
    };
    void read();
    return () => {
      active = false;
    };
  }, []);

  const enable = useCallback(async () => {
    setError(undefined);
    setBusy(true);
    try {
      // Primeiro passo do toque: o iPhone só mostra o pedido de permissão se
      // ele vier direto de um toque, sem esperar nada antes.
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setSituation(permission === "denied" ? "denied" : "off");
        if (permission === "default") {
          setError("Toque em Permitir quando o celular perguntar.");
        }
        return false;
      }
      await navigator.serviceWorker.register(SW_URL, {
        scope: SW_SCOPE,
        updateViaCache: "none",
      });
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));
      const result = await appPushSubscribeAction(
        subscription.toJSON() as PushSubscriptionJson,
      );
      if (!result.ok) {
        // Sem a API gravar, o aparelho não receberia nada: desfaz aqui também.
        await subscription.unsubscribe();
        setError(result.message);
        return false;
      }
      setSituation("on");
      return true;
    } catch {
      setError("Não foi possível ativar os avisos neste aparelho.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [publicKey]);

  const disable = useCallback(async () => {
    setError(undefined);
    setBusy(true);
    try {
      const subscription = await currentSubscription();
      if (subscription) {
        const { endpoint } = subscription;
        await subscription.unsubscribe();
        await appPushUnsubscribeAction(endpoint);
      }
      setSituation("off");
    } catch {
      setError("Não foi possível desativar. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }, []);

  return { situation, ios, busy, error, enable, disable };
}
