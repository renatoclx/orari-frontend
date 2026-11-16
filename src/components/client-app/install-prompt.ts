// Regras do convite para instalar o app (screens/app-cliente.md, "Instalar no
// celular"). Funções puras: quem lê o navegador é o InstallPrompt.

/** Por quantos dias o convite fica quieto depois de fechado ou recusado. */
export const INSTALL_DISMISS_DAYS = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

// Navegadores do iPhone que não são o Safari. O app só instala pelo Safari.
const OTHER_IOS_BROWSERS =
  /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\/|DuckDuckGo|YaBrowser|Brave/;

/**
 * Safari do iPhone/iPad? Navegadores de outras marcas e o navegador de dentro
 * de outros apps (Instagram, WhatsApp) não mandam o termo "Safari".
 */
export function isIosSafari(userAgent: string): boolean {
  return /Safari\//.test(userAgent) && !OTHER_IOS_BROWSERS.test(userAgent);
}

/** O convite foi fechado há menos de `INSTALL_DISMISS_DAYS` dias? */
export function dismissedRecently(
  dismissedAt: number | null,
  now: number,
): boolean {
  if (dismissedAt === null || dismissedAt > now) return false;
  return now - dismissedAt < INSTALL_DISMISS_DAYS * DAY_MS;
}

/**
 * Que convite mostrar:
 * - android: o navegador deixou o evento de instalar guardado;
 * - ios: o iPhone não tem evento; mostra como instalar;
 * - null: já instalado (aberto como app) ou sem como instalar.
 */
export function installMode(device: {
  ios: boolean;
  standalone: boolean;
  hasPromptEvent: boolean;
}): "android" | "ios" | null {
  if (device.standalone) return null;
  if (device.ios) return "ios";
  return device.hasPromptEvent ? "android" : null;
}
