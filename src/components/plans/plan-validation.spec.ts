import { describe, expect, it } from "vitest";
import {
  MAX_SESSIONS_PER_WEEK,
  hasErrors,
  validatePlanForm,
  type PeriodDraft,
  type PlanFormValues,
} from "@/components/plans/plan-validation";

const period = (overrides: Partial<PeriodDraft> = {}): PeriodDraft => ({
  key: "p1",
  months: "3",
  discountPercent: "10",
  monthlyDiscountPercent: "5",
  ...overrides,
});

const valid = (overrides: Partial<PlanFormValues> = {}): PlanFormValues => ({
  name: "Bem-estar",
  description: "",
  monthlyPrice: "40000",
  services: [{ serviceId: "s1", sessionsPerWeek: 2 }],
  periods: [period()],
  ...overrides,
});

describe("validatePlanForm", () => {
  it("um plano completo não tem erros", () => {
    const errors = validatePlanForm(valid());

    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it("nome e valor mensal são obrigatórios", () => {
    const errors = validatePlanForm(valid({ name: "   ", monthlyPrice: "" }));

    expect(errors.name).toBe("Informe o nome do plano.");
    expect(errors.monthlyPrice).toBe("Informe o valor mensal.");
    expect(hasErrors(errors)).toBe(true);
  });

  it("o valor mensal cabe no Decimal(10,2) do banco", () => {
    expect(
      validatePlanForm(valid({ monthlyPrice: "9999999999" })).monthlyPrice,
    ).toBeUndefined();
    expect(
      validatePlanForm(valid({ monthlyPrice: "10000000000" })).monthlyPrice,
    ).toBe("Informe um valor menor.");
  });

  describe("serviços", () => {
    it("exige ao menos um", () => {
      expect(validatePlanForm(valid({ services: [] })).services).toBe(
        "Escolha ao menos um serviço.",
      );
    });

    it("não aceita serviço inativo", () => {
      const errors = validatePlanForm(valid(), ["s1"]);

      expect(errors.services).toBe("Remova os serviços inativos para salvar.");
    });

    it("os atendimentos por semana vão de 1 a 7", () => {
      const withSessions = (sessionsPerWeek: number) =>
        validatePlanForm(
          valid({ services: [{ serviceId: "s1", sessionsPerWeek }] }),
        ).services;

      expect(MAX_SESSIONS_PER_WEEK).toBe(7);
      expect(withSessions(1)).toBeUndefined();
      expect(withSessions(7)).toBeUndefined();
      expect(withSessions(0)).toBe("Os atendimentos por semana vão de 1 a 7.");
      expect(withSessions(8)).toBe("Os atendimentos por semana vão de 1 a 7.");
      expect(withSessions(1.5)).toBe(
        "Os atendimentos por semana vão de 1 a 7.",
      );
    });
  });

  describe("períodos", () => {
    it("os meses são inteiros a partir de 1", () => {
      for (const months of ["", "0", "-2", "2.5", "abc"]) {
        const errors = validatePlanForm(
          valid({ periods: [period({ months })] }),
        );
        expect(errors.periods?.p1).toBe("Informe os meses (a partir de 1).");
      }
    });

    it("não repete o mesmo número de meses", () => {
      const errors = validatePlanForm(
        valid({
          periods: [period({ key: "a" }), period({ key: "b", months: "3" })],
        }),
      );

      expect(errors.periods).toEqual({ b: "O período de 3 meses já existe." });
    });

    it("os descontos vão de 0 a 100, com até duas casas", () => {
      const ok = ["0", "100", "12,5", "12.50", "0,01"];
      const bad = ["", "-1", "100,01", "101", "10,555", "abc", "1,2,3"];

      for (const value of ok) {
        const errors = validatePlanForm(
          valid({ periods: [period({ discountPercent: value })] }),
        );
        expect(errors.periods).toBeUndefined();
      }
      for (const value of bad) {
        const errors = validatePlanForm(
          valid({ periods: [period({ monthlyDiscountPercent: value })] }),
        );
        expect(errors.periods?.p1).toBe(
          "Os descontos vão de 0 a 100, com até duas casas decimais.",
        );
      }
    });

    it("cada período tem o seu erro, pela chave da linha", () => {
      const errors = validatePlanForm(
        valid({
          periods: [
            period({ key: "ok", months: "3" }),
            period({ key: "ruim", months: "6", discountPercent: "200" }),
          ],
        }),
      );

      expect(Object.keys(errors.periods ?? {})).toEqual(["ruim"]);
    });

    it("um plano sem períodos é válido (só o mensal)", () => {
      expect(validatePlanForm(valid({ periods: [] }))).toEqual({});
    });
  });
});
