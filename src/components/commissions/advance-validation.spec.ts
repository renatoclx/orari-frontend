import { describe, expect, it } from "vitest";
import { validateAdvance } from "@/components/commissions/advance-validation";

const today = "2026-11-10";
const ok = {
  professionalId: "p1",
  cents: "3000",
  date: "2026-11-10",
  paymentMethodId: "m1",
};

describe("validateAdvance", () => {
  it("dentro do disponível, com data de hoje ou passada", () => {
    expect(validateAdvance(ok, today, 4800)).toEqual({});
    expect(validateAdvance({ ...ok, date: "2026-10-01" }, today, null)).toEqual(
      {},
    );
  });

  it("falta de campo, data futura e valor acima do disponível", () => {
    expect(
      validateAdvance(
        { professionalId: "", cents: "", date: "", paymentMethodId: "" },
        today,
        null,
      ),
    ).toEqual({
      professionalId: "Escolha o profissional.",
      paymentMethodId: "Escolha o método de pagamento.",
      date: "Informe a data.",
      cents: "Informe o valor.",
    });
    expect(
      validateAdvance({ ...ok, date: "2026-11-11" }, today, null).date,
    ).toBe("A data não pode ser futura.");
    expect(validateAdvance(ok, today, 2000).cents).toBe(
      "O valor passa do disponível para adiantar.",
    );
  });
});
