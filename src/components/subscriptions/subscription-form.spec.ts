import { describe, expect, it } from "vitest";
import {
  initialSubscriptionValues,
  toSubscriptionInput,
  validateSubscriptionForm,
  type SubscriptionFormValues,
} from "@/components/subscriptions/subscription-form";

const valid: SubscriptionFormValues = {
  plan: "PLUS",
  cycle: "MONTHLY",
  extraProfessionals: "1",
  anamnesisAddon: false,
  priceCents: "10680",
  discountPercent: "",
  discountUntil: "",
  trialEndsAt: "",
  paidUntil: "2026-12-17",
  canceledAt: "",
};

describe("initialSubscriptionValues", () => {
  it("sem assinatura: Essencial mensal, valor sugerido e 7 dias de teste contando hoje", () => {
    const values = initialSubscriptionValues(
      null,
      () => 4490,
      new Date(2026, 10, 30),
    );
    expect(values).toMatchObject({
      plan: "ESSENTIAL",
      cycle: "MONTHLY",
      priceCents: "4490",
      trialEndsAt: "2026-12-06",
      paidUntil: "",
    });
  });
});

describe("validateSubscriptionForm", () => {
  it("formulário válido não tem erros", () => {
    expect(validateSubscriptionForm(valid)).toEqual({});
  });

  it("exige o fim do teste ou o pago até", () => {
    expect(
      validateSubscriptionForm({ ...valid, paidUntil: "" }).paidUntil,
    ).toBeDefined();
  });

  it("desconto exige 1 a 100% e a data até quando vale", () => {
    expect(
      validateSubscriptionForm({ ...valid, discountPercent: "0" })
        .discountPercent,
    ).toBeDefined();
    expect(
      validateSubscriptionForm({ ...valid, discountPercent: "50" })
        .discountUntil,
    ).toBeDefined();
  });

  it("valor zero e extras fora de 0 a 99 são recusados", () => {
    const errors = validateSubscriptionForm({
      ...valid,
      priceCents: "",
      extraProfessionals: "100",
    });
    expect(Object.keys(errors).sort()).toEqual([
      "extraProfessionals",
      "priceCents",
    ]);
  });
});

describe("toSubscriptionInput", () => {
  it("converte centavos e vazios em nulos; sem desconto, descarta o até quando", () => {
    expect(
      toSubscriptionInput({ ...valid, discountUntil: "2027-01-01" }),
    ).toEqual({
      plan: "PLUS",
      cycle: "MONTHLY",
      extraProfessionals: 1,
      anamnesisAddon: false,
      price: 106.8,
      discountPercent: null,
      discountUntil: null,
      trialEndsAt: null,
      paidUntil: "2026-12-17",
      canceledAt: null,
    });
  });
});
