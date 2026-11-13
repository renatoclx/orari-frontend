import { describe, expect, it } from "vitest";
import {
  badgeText,
  bellLabel,
  CATEGORY_HINT,
  CATEGORY_LABEL,
  relativeTime,
} from "./notification-format";

describe("badgeText", () => {
  it("some em zero, mostra o número e limita em 99+", () => {
    expect(badgeText(0)).toBe("");
    expect(badgeText(-1)).toBe("");
    expect(badgeText(1)).toBe("1");
    expect(badgeText(99)).toBe("99");
    expect(badgeText(100)).toBe("99+");
    expect(badgeText(5000)).toBe("99+");
  });
});

describe("bellLabel", () => {
  it("diz quantas não lidas, no singular e no plural", () => {
    expect(bellLabel(0)).toBe("Notificações");
    expect(bellLabel(1)).toBe("Notificações: 1 não lida");
    expect(bellLabel(7)).toBe("Notificações: 7 não lidas");
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-11-13T12:00:00.000Z");
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it("escolhe a unidade pelo tempo que passou", () => {
    expect(relativeTime(ago(20_000), now)).toBe("agora");
    expect(relativeTime(ago(5 * 60_000), now)).toBe("há 5 min");
    expect(relativeTime(ago(59 * 60_000), now)).toBe("há 59 min");
    expect(relativeTime(ago(2 * 3_600_000), now)).toBe("há 2 h");
    expect(relativeTime(ago(30 * 3_600_000), now)).toBe("ontem");
    expect(relativeTime(ago(3 * 86_400_000), now)).toBe("há 3 dias");
  });

  it("de uma semana em diante, mostra a data", () => {
    expect(relativeTime("2026-11-01T12:00:00.000Z", now)).toBe("01/11/2026");
  });

  it("uma data no futuro (relógio adiantado) vale como agora", () => {
    expect(relativeTime(ago(-60_000), now)).toBe("agora");
  });
});

describe("categorias", () => {
  it("toda categoria tem nome e explicação", () => {
    for (const category of Object.keys(CATEGORY_LABEL)) {
      expect(CATEGORY_HINT).toHaveProperty(category);
    }
  });
});
