import { describe, expect, it } from "vitest";
import {
  cancellationPreview,
  initialSubscriptionValues,
  launchOfferUntil,
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

  it("sem pagamento, exige o último dia do teste", () => {
    expect(
      validateSubscriptionForm({ ...valid, paidUntil: "" }).trialEndsAt,
    ).toBe("Informe o último dia do teste grátis.");
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

describe("launchOfferUntil", () => {
  it("3 meses de pagamento a partir do dia seguinte ao teste", () => {
    expect(
      launchOfferUntil(
        { paidUntil: "", trialEndsAt: "2026-11-25" },
        "2026-11-19",
        3,
      ),
    ).toBe("2027-02-25");
  });

  it("com pagamento, conta do dia seguinte ao pago até; sem nada, de hoje", () => {
    expect(
      launchOfferUntil(
        { paidUntil: "2026-12-23", trialEndsAt: "2026-11-01" },
        "2026-11-19",
        3,
      ),
    ).toBe("2027-03-23");
    expect(
      launchOfferUntil({ paidUntil: "", trialEndsAt: "" }, "2026-11-19", 3),
    ).toBe("2027-02-18");
  });
});

describe("cancellationPreview", () => {
  it("usa até o fim do que pagou e só consulta no dia seguinte", () => {
    expect(
      cancellationPreview(
        { paidUntil: "2026-12-23", trialEndsAt: null },
        "2026-11-19",
      ),
    ).toEqual({ lastDay: "2026-12-23", from: "2026-12-24" });
  });

  it("nada em andamento: a partir de hoje", () => {
    expect(
      cancellationPreview(
        { paidUntil: "2026-10-01", trialEndsAt: "2026-09-01" },
        "2026-11-19",
      ),
    ).toEqual({ lastDay: null, from: "2026-11-19" });
  });
});
