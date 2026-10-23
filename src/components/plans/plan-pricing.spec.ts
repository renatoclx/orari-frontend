import { describe, expect, it } from "vitest";
import {
  WEEKS_PER_MONTH,
  describeMonths,
  formatPercent,
  parsePercent,
  periodPricing,
  suggestedMonthlyCents,
  toCents,
} from "@/components/plans/plan-pricing";

describe("periodPricing", () => {
  it("calcula o integral e o mensal com desconto (R$ 400, 3 meses, 10% e 5%)", () => {
    const pricing = periodPricing(40000, 3, 10, 5);

    // Integral: 3 × 400 = 1.200, menos 10% = 1.080.
    expect(pricing.integralTotal).toBe(108000);
    // Mensal: 400 menos 5% = 380 por parcela, 1.140 no total.
    expect(pricing.installment).toBe(38000);
    expect(pricing.monthlyTotal).toBe(114000);
  });

  it("sem desconto, o valor é o mensal vezes os meses", () => {
    const pricing = periodPricing(25000, 6, 0, 0);

    expect(pricing.integralTotal).toBe(150000);
    expect(pricing.installment).toBe(25000);
    expect(pricing.monthlyTotal).toBe(150000);
  });

  it("desconto de 100% zera o valor", () => {
    const pricing = periodPricing(25000, 3, 100, 100);

    expect(pricing.integralTotal).toBe(0);
    expect(pricing.installment).toBe(0);
    expect(pricing.monthlyTotal).toBe(0);
  });

  it("arredonda meio centavo para cima", () => {
    // 5 centavos com 50% = 2,5 → 3.
    expect(periodPricing(5, 1, 50, 50).installment).toBe(3);
    expect(periodPricing(5, 1, 50, 50).integralTotal).toBe(3);
    // 10,01 com 50% = 5,005 → 5,01.
    expect(periodPricing(1001, 1, 50, 50).installment).toBe(501);
  });

  it("arredonda para baixo abaixo de meio centavo", () => {
    // 10,01 com 33,33% de desconto = 6,6737 → 6,67.
    expect(periodPricing(1001, 1, 33.33, 33.33).installment).toBe(667);
  });

  it("no mensal, a parcela é arredondada antes do total", () => {
    // Parcela de 5,005 → 5,01; o total é 3 × 5,01, não 15,015 arredondado.
    const pricing = periodPricing(1001, 3, 0, 50);

    expect(pricing.installment).toBe(501);
    expect(pricing.monthlyTotal).toBe(1503);
  });

  it("no integral, o desconto vale sobre o total, não sobre cada mês", () => {
    // 3 × 10,01 = 30,03; 50% = 15,015 → 15,02 (e não 3 × 5,01 = 15,03).
    expect(periodPricing(1001, 3, 50, 0).integralTotal).toBe(1502);
  });

  it("não perde precisão com valores muito grandes", () => {
    const pricing = periodPricing(10_000_000_000, 12, 12.5, 12.5);

    expect(pricing.integralTotal).toBe(105_000_000_000);
    expect(pricing.installment).toBe(8_750_000_000);
    expect(pricing.monthlyTotal).toBe(105_000_000_000);
  });
});

describe("suggestedMonthlyCents", () => {
  it("é o preço avulso × atendimentos por semana × 4 semanas, somado", () => {
    expect(WEEKS_PER_MONTH).toBe(4);
    expect(
      suggestedMonthlyCents([
        { priceCents: 5000, sessionsPerWeek: 2 },
        { priceCents: 10000, sessionsPerWeek: 1 },
      ]),
    ).toBe(5000 * 2 * 4 + 10000 * 1 * 4);
  });

  it("serviço sem preço conta como zero", () => {
    expect(
      suggestedMonthlyCents([
        { priceCents: 5000, sessionsPerWeek: 1 },
        { priceCents: null, sessionsPerWeek: 3 },
      ]),
    ).toBe(20000);
  });

  it("sem serviços, é zero", () => {
    expect(suggestedMonthlyCents([])).toBe(0);
  });
});

describe("toCents", () => {
  it("converte reais em centavos", () => {
    expect(toCents("400")).toBe(40000);
    expect(toCents("400.5")).toBe(40050);
    expect(toCents("0")).toBe(0);
  });

  it("não sofre com o erro de ponto flutuante", () => {
    // 0,29 × 100 dá 28,999999999999996 em ponto flutuante.
    expect(toCents("0.29")).toBe(29);
    expect(toCents("19.99")).toBe(1999);
    expect(toCents("1.15")).toBe(115);
  });
});

describe("parsePercent", () => {
  it("aceita vírgula ou ponto e ignora espaços", () => {
    expect(parsePercent("12,5")).toBe(12.5);
    expect(parsePercent("12.5")).toBe(12.5);
    expect(parsePercent(" 10 ")).toBe(10);
    expect(parsePercent("0")).toBe(0);
  });

  it("vazio ou inválido vira NaN", () => {
    expect(parsePercent("")).toBeNaN();
    expect(parsePercent("   ")).toBeNaN();
    expect(parsePercent("abc")).toBeNaN();
    expect(parsePercent("1,2,3")).toBeNaN();
  });
});

describe("formatPercent", () => {
  it("usa vírgula decimal e o símbolo", () => {
    expect(formatPercent(12.5)).toBe("12,5%");
    expect(formatPercent("10")).toBe("10%");
    expect(formatPercent("7.50")).toBe("7,5%");
    expect(formatPercent(0)).toBe("0%");
  });
});

describe("describeMonths", () => {
  it("escreve a lista de períodos em português", () => {
    expect(describeMonths([])).toBe("");
    expect(describeMonths([1])).toBe("1 mês");
    expect(describeMonths([3])).toBe("3 meses");
    expect(describeMonths([6, 3])).toBe("3 e 6 meses");
    expect(describeMonths([12, 3, 6])).toBe("3, 6 e 12 meses");
  });

  it("não altera a lista recebida", () => {
    const months = [12, 3];

    describeMonths(months);

    expect(months).toEqual([12, 3]);
  });
});
