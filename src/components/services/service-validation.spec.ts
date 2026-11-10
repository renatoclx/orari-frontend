import { describe, expect, it } from "vitest";
import {
  parseCommission,
  serviceFieldOrder,
  validateServiceForm,
} from "@/components/services/service-validation";

describe("validateServiceForm", () => {
  it("nome e duração bastam; o preço é opcional", () => {
    expect(
      validateServiceForm({ name: "Massagem", duration: "30", price: "" }),
    ).toEqual({});
  });

  it("o nome é obrigatório", () => {
    expect(
      validateServiceForm({ name: "   ", duration: "30", price: "" }).name,
    ).toBe("Informe o nome.");
  });

  it("a duração é obrigatória e de pelo menos 1 minuto", () => {
    const duration = (value: string) =>
      validateServiceForm({ name: "A", duration: value, price: "" }).duration;

    expect(duration("")).toBe("Informe a duração em minutos.");
    expect(duration("0")).toBe("Informe a duração em minutos.");
    expect(duration("1")).toBeUndefined();
  });

  it("o preço cabe no Decimal(10,2) do banco", () => {
    const price = (value: string) =>
      validateServiceForm({ name: "A", duration: "30", price: value }).price;

    expect(price("9999999999")).toBeUndefined();
    expect(price("10000000000")).toBe("Informe um preço menor.");
  });

  it("junta os erros de vários campos", () => {
    const errors = validateServiceForm({
      name: "",
      duration: "",
      price: "10000000000",
    });

    // A comissão entra na ordem de foco, mas é conferida por parseCommission.
    expect(Object.keys(errors)).toEqual(
      serviceFieldOrder.filter((field) => field !== "commission"),
    );
  });
});

describe("parseCommission", () => {
  const none = { percent: "", cents: "" };

  it("sem tipo: tira a comissão", () => {
    expect(parseCommission({ type: "NONE", ...none })).toEqual({
      ok: true,
      commissionType: null,
      commissionValue: null,
    });
  });

  it("percentual com vírgula, de 0,01 a 100", () => {
    expect(
      parseCommission({ type: "PERCENT", percent: "12,5", cents: "" }),
    ).toMatchObject({ ok: true, commissionValue: 12.5 });
    for (const bad of ["", "0", "101", "10,555", "abc"]) {
      expect(
        parseCommission({ type: "PERCENT", percent: bad, cents: "" }).ok,
      ).toBe(false);
    }
  });

  it("valor fixo em centavos vira reais; zero é recusado", () => {
    expect(
      parseCommission({ type: "FIXED", percent: "", cents: "2550" }),
    ).toMatchObject({
      ok: true,
      commissionType: "FIXED",
      commissionValue: 25.5,
    });
    expect(parseCommission({ type: "FIXED", percent: "", cents: "0" }).ok).toBe(
      false,
    );
  });
});
