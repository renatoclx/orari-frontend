import { describe, expect, it } from "vitest";
import {
  initialPaymentValues,
  shiftMonth,
  toPaymentInput,
  validatePaymentForm,
} from "@/components/subscription-payments/payment-form";

const suggestion = {
  periodStart: "2026-11-24",
  periodEnd: "2026-12-23",
  amount: 44.95,
};

describe("formulário de pagamento", () => {
  it("parte da sugestão: período, valor em centavos, hoje e Pix", () => {
    expect(initialPaymentValues(suggestion, "2026-11-17")).toEqual({
      amountCents: "4495",
      paidAt: "2026-11-17",
      method: "PIX",
      periodStart: "2026-11-24",
      periodEnd: "2026-12-23",
      note: "",
    });
  });

  it("exige valor, data e período em ordem", () => {
    const values = initialPaymentValues(suggestion, "2026-11-17");
    expect(validatePaymentForm(values)).toEqual({});
    expect(
      Object.keys(
        validatePaymentForm({
          ...values,
          amountCents: "",
          periodEnd: "2026-11-01",
        }),
      ).sort(),
    ).toEqual(["amountCents", "periodEnd"]);
  });

  it("converte para o corpo da API", () => {
    const values = {
      ...initialPaymentValues(suggestion, "2026-11-17"),
      note: "  ",
    };
    expect(toPaymentInput(values)).toMatchObject({ amount: 44.95, note: null });
  });

  it("navega entre os meses, virando o ano", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });
});
