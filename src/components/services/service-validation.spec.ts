import { describe, expect, it } from "vitest";
import {
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

    expect(Object.keys(errors)).toEqual(serviceFieldOrder);
  });
});
