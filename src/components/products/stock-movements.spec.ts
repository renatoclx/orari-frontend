import { describe, expect, it } from "vitest";
import {
  balanceAfter,
  isLowStock,
  signed,
  validateMovement,
  type MovementFormValues,
} from "@/components/products/stock-movements";

const base: MovementFormValues = {
  type: "LOSS",
  quantity: "2",
  unitCost: "",
  withPayable: false,
  categoryId: "",
  dueDate: "",
  paid: false,
  methodId: "",
};

describe("balanceAfter", () => {
  it("compra soma, saídas subtraem e o ajuste define", () => {
    expect(balanceAfter("PURCHASE", 10, 5)).toBe(15);
    expect(balanceAfter("INTERNAL_USE", 10, 3)).toBe(7);
    expect(balanceAfter("LOSS", 10, 3)).toBe(7);
    expect(balanceAfter("ADJUSTMENT", 10, 8)).toBe(8);
    expect(balanceAfter("LOSS", 10, null)).toBeNull();
  });
});

describe("validateMovement", () => {
  it("aceita uma saída dentro do estoque", () => {
    expect(validateMovement(base, 10)).toEqual({});
  });

  it("recusa saída maior que o estoque, com o saldo", () => {
    expect(validateMovement({ ...base, quantity: "11" }, 10).quantity).toBe(
      "Estoque insuficiente: há 10 em estoque.",
    );
  });

  it("quantidade zero só vale no ajuste, e o ajuste igual é recusado", () => {
    expect(
      validateMovement({ ...base, quantity: "0" }, 10).quantity,
    ).toBeDefined();
    expect(
      validateMovement({ ...base, type: "ADJUSTMENT", quantity: "0" }, 10),
    ).toEqual({});
    expect(
      validateMovement({ ...base, type: "ADJUSTMENT", quantity: "10" }, 10)
        .quantity,
    ).toBe("O saldo contado é igual ao estoque atual.");
  });

  it("compra exige o custo; com a conta, categoria, vencimento e o método se já paga", () => {
    const purchase = { ...base, type: "PURCHASE" as const };
    expect(Object.keys(validateMovement(purchase, 0))).toEqual(["unitCost"]);
    expect(
      Object.keys(
        validateMovement(
          { ...purchase, unitCost: "1000", withPayable: true, paid: true },
          0,
        ),
      ).sort(),
    ).toEqual(["categoryId", "dueDate", "methodId"]);
    expect(
      validateMovement(
        {
          ...purchase,
          unitCost: "1000",
          withPayable: true,
          categoryId: "c",
          dueDate: "2026-11-20",
        },
        0,
      ),
    ).toEqual({});
  });
});

describe("isLowStock e signed", () => {
  it("baixo só abaixo do mínimo informado", () => {
    expect(isLowStock({ currentStock: 2, minimalStock: 3 })).toBe(true);
    expect(isLowStock({ currentStock: 3, minimalStock: 3 })).toBe(false);
    expect(isLowStock({ currentStock: 0, minimalStock: null })).toBe(false);
  });

  it("sinal da variação", () => {
    expect(signed(10)).toBe("+10");
    expect(signed(-3)).toBe("-3");
  });
});
