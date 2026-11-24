import { describe, expect, it } from "vitest";
import { suggestedPrice } from "@/components/subscriptions/subscription-catalog";

const base = { extraProfessionals: 0, anamnesisAddon: false };

describe("suggestedPrice", () => {
  it("mensal: o preço do plano", () => {
    expect(suggestedPrice({ ...base, plan: "PLUS", cycle: "MONTHLY" })).toBe(
      89.9,
    );
  });

  it("extras e anamnese somam ao mensal", () => {
    expect(
      suggestedPrice({
        plan: "ESSENTIAL",
        cycle: "MONTHLY",
        extraProfessionals: 2,
        anamnesisAddon: true,
      }),
    ).toBe(103.6);
  });

  it("semestral: parcela com 15% arredondada para ,90, vezes 6", () => {
    // 89,90 × 0,85 = 76,415 → 76,90 (o mesmo da landing); × 6 = 461,40.
    expect(suggestedPrice({ ...base, plan: "PLUS", cycle: "SEMIANNUAL" })).toBe(
      461.4,
    );
  });

  it("anual: parcela com 30% arredondada para ,90, vezes 12", () => {
    // 129,90 × 0,7 = 90,93 → 90,90; × 12 = 1.090,80.
    expect(suggestedPrice({ ...base, plan: "CLINICAL", cycle: "ANNUAL" })).toBe(
      1090.8,
    );
  });

  it("Clinical: o adicional de anamnese não soma (já vem incluída)", () => {
    expect(
      suggestedPrice({
        plan: "CLINICAL",
        cycle: "MONTHLY",
        extraProfessionals: 0,
        anamnesisAddon: true,
      }),
    ).toBe(129.9);
  });
});
