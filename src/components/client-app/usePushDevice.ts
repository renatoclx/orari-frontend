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

/** O que a ativação grava e apaga na API: o cliente e o profissional têm as suas. */
export type PushActions = {
  subscribe: (
    subscription: PushSubscriptionJson,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  unsubscribe: (
    endpoint: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
};

// Padrão: as do app do cliente (módulo, para a identidade ser estável nas dependências).
const CLIENT_ACTIONS: PushActions = {
  subscribe: appPushSubscribeAction,
  unsubscribe: appPushUnsubscribeAction,
};

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

// Cada etapa da ativação tem um limite: travada, vira um erro que diz onde
// parou (no celular não há console para descobrir). O pedido de permissão fica
// de fora: ali quem decide o tempo é o cliente.
const STEP_TIMEOUT_MS = 20_000;

const STEP_MESSAGES = {
  worker:
    "O app não conseguiu preparar os avisos neste aparelho. Feche e abra o app e tente de novo.",
  subscribe:
    "O serviço de avisos do celular não respondeu. Tente de novo em instantes.",
  save: "Não foi possível salvar os avisos. Tente de novo.",
} as const;

type Step = keyof typeof STEP_MESSAGES;

class StepError extends Error {
  constructor(readonly step: Step) {
    super(STEP_MESSAGES[step]);
  }
}

/** A etapa termina, falha (vira o erro dela) ou passa do limite. */
function step<T>(name: Step, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new StepError(name)),
      STEP_TIMEOUT_MS,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        reject(new StepError(name));
      },
    );
  });
}

/**
 * Espera o service worker deste registro ficar ativo. Não usa o
 * `navigator.serviceWorker.ready`: ele procura o registro pelo endereço em que
 * a página abriu, e o app instalado abre em /app, fora do escopo /app/ (as
 * telas seguintes não recarregam a página). No iPhone, o `ready` nunca
 * terminava; esperar o próprio registro vale para qualquer navegador.
 */
function activeRegistration(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> {
  if (registration.active) return Promise.resolve(registration);
  const worker = registration.installing ?? registration.waiting;
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(new Error("Registro sem service worker."));
      return;
    }
    worker.addEventListener("statechange", () => {
      if (worker.state === "activated") resolve(registration);
      if (worker.state === "redundant") {
        reject(new Error("O service worker não foi instalado."));
      }
    });
  });
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  return registration ? registration.pushManager.getSubscription() : null;
}

/**
 * Os avisos neste aparelho: a situação (ver `pushSituation`), ativar e
 * desativar. `situation` é nula até ler o navegador, depois de montar (o
 * servidor não sabe nada do aparelho e o HTML tem que bater na hidratação).
 */
export function usePushDevice(
  publicKey: string,
  actions: PushActions = CLIENT_ACTIONS,
) {
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
        void actions.subscribe(subscription.toJSON() as PushSubscriptionJson);
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
  }, [actions]);

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
      const registration = await step(
        "worker",
        navigator.serviceWorker
          .register(SW_URL, { scope: SW_SCOPE, updateViaCache: "none" })
          .then(activeRegistration),
      );
      const subscription = await step(
        "subscribe",
        registration.pushManager.getSubscription().then(
          (existing) =>
            existing ??
            registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            }),
        ),
      );
      const result = await step(
        "save",
        actions.subscribe(subscription.toJSON() as PushSubscriptionJson),
      );
      if (!result.ok) {
        // Sem a API gravar, o aparelho não receberia nada: desfaz aqui também.
        await subscription.unsubscribe();
        setError(result.message);
        return false;
      }
      setSituation("on");
      return true;
    } catch (failure) {
      setError(
        failure instanceof StepError
          ? failure.message
          : "Não foi possível ativar os avisos neste aparelho.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }, [publicKey, actions]);

  const disable = useCallback(async () => {
    setError(undefined);
    setBusy(true);
    try {
      const subscription = await currentSubscription();
      if (subscription) {
        const { endpoint } = subscription;
        await subscription.unsubscribe();
        await actions.unsubscribe(endpoint);
      }
      setSituation("off");
    } catch {
      setError("Não foi possível desativar. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }, [actions]);

  return { situation, ios, busy, error, enable, disable };
}
