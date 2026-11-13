import { describe, expect, it } from "vitest";
import type { Onboarding } from "@/types/onboarding";
import {
  onboardingItems,
  progressPercent,
  progressText,
  showOnboarding,
} from "./onboarding";

const base: Onboarding = {
  dismissed: false,
  completed: 2,
  total: 6,
  steps: [
    { key: "SERVICE", done: true, optional: false },
    { key: "PROFESSIONAL", done: false, optional: false },
    { key: "PORTAL", done: false, optional: true },
  ],
};

describe("onboardingItems", () => {
  it("dá texto e tela a cada passo, na ordem recebida", () => {
    const items = onboardingItems(base);
    expect(items.map((item) => item.key)).toEqual([
      "SERVICE",
      "PROFESSIONAL",
      "PORTAL",
    ]);
    expect(items[1]).toMatchObject({
      label: "Cadastre um profissional",
      href: "/profissionais/novo",
      done: false,
    });
    expect(items[2].optional).toBe(true);
  });
});

describe("showOnboarding", () => {
  it("aparece enquanto falta algum obrigatório", () => {
    expect(showOnboarding(base)).toBe(true);
  });
  it("some ao dispensar ou ao completar os obrigatórios (o opcional não conta)", () => {
    expect(showOnboarding({ ...base, dismissed: true })).toBe(false);
    expect(showOnboarding({ ...base, completed: 6 })).toBe(false);
  });
  it("sem passo nenhum no plano, não aparece", () => {
    expect(showOnboarding({ ...base, total: 0, completed: 0, steps: [] })).toBe(
      false,
    );
  });
});

describe("progresso", () => {
  it("escreve e mede o avanço", () => {
    expect(progressText(base)).toBe("2 de 6 concluídos");
    expect(progressPercent(base)).toBe(33);
    expect(progressPercent({ ...base, total: 0 })).toBe(0);
  });
});
