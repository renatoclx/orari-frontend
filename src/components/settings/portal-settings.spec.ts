import { describe, expect, it } from "vitest";
import {
  daysAheadError,
  formatCancelHours,
  formatMinutes,
  optionsWith,
  portalUrl,
  samePortalSettings,
} from "@/components/settings/portal-settings";

describe("formatMinutes", () => {
  it("escreve a antecedência por extenso", () => {
    expect(formatMinutes(0)).toBe("Sem antecedência");
    expect(formatMinutes(30)).toBe("30 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(90)).toBe("1 h 30 min");
    expect(formatMinutes(1440)).toBe("1 dia");
    expect(formatMinutes(2880)).toBe("2 dias");
  });
});

describe("formatCancelHours", () => {
  it("escreve o prazo de cancelamento", () => {
    expect(formatCancelHours(0)).toBe("Até o início");
    expect(formatCancelHours(1)).toBe("1 hora antes");
    expect(formatCancelHours(12)).toBe("12 horas antes");
    expect(formatCancelHours(24)).toBe("1 dia antes");
    expect(formatCancelHours(72)).toBe("3 dias antes");
  });
});

describe("optionsWith", () => {
  it("inclui o valor gravado que não é uma das opções, em ordem", () => {
    expect(optionsWith([0, 60, 120], 90)).toEqual([0, 60, 90, 120]);
    expect(optionsWith([0, 60, 120], 60)).toEqual([0, 60, 120]);
  });
});

describe("daysAheadError", () => {
  it("aceita inteiros de 1 a 365", () => {
    expect(daysAheadError("1")).toBeUndefined();
    expect(daysAheadError(" 365 ")).toBeUndefined();
    for (const bad of ["", "0", "366", "2,5", "abc"]) {
      expect(daysAheadError(bad)).toMatch(/1 a 365/);
    }
  });
});

describe("portalUrl", () => {
  it("monta o endereço sem barra dupla", () => {
    expect(portalUrl("https://app.orariapp.com.br/", "aurora")).toBe(
      "https://app.orariapp.com.br/p/aurora",
    );
  });
});

describe("samePortalSettings", () => {
  const base = {
    enabled: true,
    minAdvanceMinutes: 60,
    maxDaysAhead: 30,
    cancelUntilHours: 24,
  };
  it("compara as quatro regras", () => {
    expect(samePortalSettings(base, { ...base })).toBe(true);
    expect(samePortalSettings(base, { ...base, maxDaysAhead: 15 })).toBe(false);
  });
});
