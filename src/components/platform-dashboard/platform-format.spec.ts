import { describe, expect, it } from "vitest";
import {
  dueText,
  lastActivityText,
  monthLabel,
  monthLongLabel,
} from "@/components/platform-dashboard/platform-format";

describe("textos do Painel", () => {
  it("meses curtos e longos", () => {
    expect(monthLabel("2026-11")).toBe("nov/26");
    expect(monthLabel("2027-01")).toBe("jan/27");
    expect(monthLongLabel("2026-11")).toBe("novembro de 2026");
  });

  it("última atividade em dias", () => {
    const now = new Date("2026-12-15T12:00:00Z");
    expect(lastActivityText(null, now)).toBe("nunca");
    expect(lastActivityText("2026-12-15T08:00:00Z", now)).toBe("hoje");
    expect(lastActivityText("2026-12-14T08:00:00Z", now)).toBe("ontem");
    expect(lastActivityText("2026-12-01T08:00:00Z", now)).toBe("há 14 dias");
  });

  it("prazo relativo a hoje", () => {
    expect(dueText("2026-12-15", "2026-12-15")).toBe("hoje");
    expect(dueText("2026-12-16", "2026-12-15")).toBe("amanhã");
    expect(dueText("2026-12-20", "2026-12-15")).toBe("em 5 dias");
    expect(dueText("2026-12-13", "2026-12-15")).toBe("há 2 dias");
  });
});
