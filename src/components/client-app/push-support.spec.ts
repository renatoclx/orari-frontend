import { describe, expect, it } from "vitest";
import {
  isIosDevice,
  messageWhen,
  pushSituation,
  testResultMessage,
  urlBase64ToUint8Array,
} from "./push-support";

const device = {
  supported: true,
  ios: false,
  standalone: false,
  permission: "default" as NotificationPermission,
  subscribed: false,
};

describe("pushSituation", () => {
  it("iPhone pelo Safari: instalar o app primeiro", () => {
    expect(pushSituation({ ...device, ios: true, supported: false })).toBe(
      "install-ios",
    );
  });

  it("iPhone com o app instalado segue as regras normais", () => {
    expect(pushSituation({ ...device, ios: true, standalone: true })).toBe(
      "off",
    );
  });

  it("navegador sem push", () => {
    expect(pushSituation({ ...device, supported: false })).toBe("unsupported");
  });

  it("permissão recusada vence a inscrição", () => {
    expect(
      pushSituation({ ...device, permission: "denied", subscribed: true }),
    ).toBe("denied");
  });

  it("ativado só com a permissão dada e a inscrição no aparelho", () => {
    expect(
      pushSituation({ ...device, permission: "granted", subscribed: true }),
    ).toBe("on");
    expect(pushSituation({ ...device, permission: "granted" })).toBe("off");
    expect(pushSituation({ ...device, subscribed: true })).toBe("off");
  });
});

describe("isIosDevice", () => {
  it.each([
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)", 5, true],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5, true],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0, false],
    ["Mozilla/5.0 (Linux; Android 14; Pixel 8)", 5, false],
  ])("%s com %i toques: %s", (userAgent, touches, expected) => {
    expect(isIosDevice(userAgent, touches)).toBe(expected);
  });
});

describe("urlBase64ToUint8Array", () => {
  it("decodifica base64url sem o preenchimento", () => {
    // "Orari?" em base64 é "T3Jhcmk/"; em base64url, "T3Jhcmk_".
    expect(Array.from(urlBase64ToUint8Array("T3Jhcmk_"))).toEqual(
      Array.from(new TextEncoder().encode("Orari?")),
    );
    expect(Array.from(urlBase64ToUint8Array("T3I"))).toEqual(
      Array.from(new TextEncoder().encode("Or")),
    );
  });
});

describe("testResultMessage", () => {
  it("diz para quantos aparelhos saiu", () => {
    expect(testResultMessage(0)).toMatch(/Nenhum aparelho/);
    expect(testResultMessage(1)).toMatch(/alguns segundos/);
    expect(testResultMessage(2)).toMatch(/2 aparelhos/);
  });
});

describe("messageWhen", () => {
  const tz = "America/Sao_Paulo";
  // 5/11/2026 às 15:00 em Brasília.
  const now = new Date("2026-11-05T18:00:00Z");

  it("hoje, ontem e antes, no fuso informado", () => {
    expect(messageWhen("2026-11-05T17:30:00Z", now, tz)).toBe("Hoje, 14:30");
    expect(messageWhen("2026-11-04T12:00:00Z", now, tz)).toBe("Ontem, 09:00");
    expect(messageWhen("2026-11-03T21:15:00Z", now, tz)).toBe("03/11, 18:15");
  });

  it("depois da meia-noite em UTC ainda é o dia anterior em Brasília", () => {
    // 6/11 às 01:00 UTC = 5/11 às 22:00 em Brasília.
    expect(
      messageWhen("2026-11-06T01:00:00Z", new Date("2026-11-06T02:00:00Z"), tz),
    ).toBe("Hoje, 22:00");
  });
});
