import { shiftDateString, toDateString, toTimeString } from "@/utils/time";

// Regras dos avisos no aparelho (screens/app-cliente.md, "Avisos"). Funções
// puras: quem lê o navegador (permissão, service worker) é o PushDeviceCard.

/**
 * O que o bloco "Avisos neste aparelho" mostra:
 * - install-ios: iPhone/iPad pelo Safari; só o app instalado recebe avisos;
 * - unsupported: navegador sem push;
 * - denied: o cliente recusou (só os ajustes do aparelho liberam);
 * - off: dá para ativar; on: ativados neste aparelho.
 */
export type PushSituation =
  "install-ios" | "unsupported" | "denied" | "off" | "on";

export function pushSituation(device: {
  supported: boolean;
  ios: boolean;
  standalone: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}): PushSituation {
  // No iPhone, o PushManager só existe no app instalado (iOS 16.4+).
  if (device.ios && !device.standalone) return "install-ios";
  if (!device.supported) return "unsupported";
  if (device.permission === "denied") return "denied";
  return device.permission === "granted" && device.subscribed ? "on" : "off";
}

/**
 * iPhone ou iPad. O iPad atual se apresenta como Mac; o que o denuncia é a
 * tela de toque.
 */
export function isIosDevice(
  userAgent: string,
  maxTouchPoints: number,
): boolean {
  return (
    /iPhone|iPad|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
  );
}

/** A chave pública VAPID (base64url) no formato que o `pushManager.subscribe` pede. */
export function urlBase64ToUint8Array(
  base64Url: string,
): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }
  return bytes;
}

/** Resposta do aviso de teste. */
export function testResultMessage(devices: number): string {
  if (devices === 0) {
    return "Nenhum aparelho recebeu. Desative e ative os avisos de novo.";
  }
  return devices === 1
    ? "Aviso de teste enviado. Ele chega em alguns segundos."
    : `Aviso de teste enviado para ${devices} aparelhos.`;
}

/** Quando o aviso chegou: "Hoje, 14:30", "Ontem, 09:00" ou "03/11, 18:15". */
export function messageWhen(iso: string, now: Date, timeZone: string): string {
  const day = toDateString(new Date(iso), timeZone);
  const today = toDateString(now, timeZone);
  const time = toTimeString(iso, timeZone);
  if (day === today) return `Hoje, ${time}`;
  if (day === shiftDateString(today, -1)) return `Ontem, ${time}`;
  const [, month, date] = day.split("-");
  return `${date}/${month}, ${time}`;
}
