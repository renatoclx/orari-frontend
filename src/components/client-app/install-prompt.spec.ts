import { describe, expect, it } from "vitest";
import {
  INSTALL_DISMISS_DAYS,
  dismissedRecently,
  installMode,
  isIosSafari,
} from "@/components/client-app/install-prompt";

const SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const CHROME_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.6312.52 Mobile/15E148 Safari/604.1";
const IN_APP =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 320.0";

describe("isIosSafari", () => {
  it("reconhece o Safari do iPhone", () => {
    expect(isIosSafari(SAFARI)).toBe(true);
  });

  it("não confunde com o Chrome do iPhone nem com o navegador de dentro de outro app", () => {
    expect(isIosSafari(CHROME_IOS)).toBe(false);
    expect(isIosSafari(IN_APP)).toBe(false);
  });
});

describe("dismissedRecently", () => {
  const now = Date.UTC(2026, 10, 16);
  const day = 24 * 60 * 60 * 1000;

  it("nunca fechado: o convite aparece", () => {
    expect(dismissedRecently(null, now)).toBe(false);
  });

  it("fechado há menos de 5 dias: fica quieto", () => {
    expect(dismissedRecently(now - 2 * day, now)).toBe(true);
    expect(dismissedRecently(now - (INSTALL_DISMISS_DAYS * day - 1), now)).toBe(
      true,
    );
  });

  it("passados os 5 dias, o convite volta", () => {
    expect(dismissedRecently(now - INSTALL_DISMISS_DAYS * day, now)).toBe(
      false,
    );
  });

  it("uma data no futuro (relógio mexido) não esconde o convite", () => {
    expect(dismissedRecently(now + day, now)).toBe(false);
  });
});

describe("installMode", () => {
  it("app já aberto como instalado: nenhum convite", () => {
    expect(
      installMode({ ios: false, standalone: true, hasPromptEvent: true }),
    ).toBeNull();
    expect(
      installMode({ ios: true, standalone: true, hasPromptEvent: false }),
    ).toBeNull();
  });

  it("iPhone no navegador: mostra como instalar", () => {
    expect(
      installMode({ ios: true, standalone: false, hasPromptEvent: false }),
    ).toBe("ios");
  });

  it("Android com o evento guardado: oferece instalar", () => {
    expect(
      installMode({ ios: false, standalone: false, hasPromptEvent: true }),
    ).toBe("android");
  });

  it("sem evento e fora do iPhone (ex.: já instalado em outro lugar): nada", () => {
    expect(
      installMode({ ios: false, standalone: false, hasPromptEvent: false }),
    ).toBeNull();
  });
});
