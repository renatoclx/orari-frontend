import { describe, expect, it } from "vitest";
import {
  cartTotal,
  saleDescription,
  suggestedPrice,
  validateCart,
  type CartLine,
} from "@/utils/sale";

const line = (extra: Partial<CartLine> = {}): CartLine => ({
  productId: "p1",
  name: "Sérum",
  stock: 5,
  quantity: "2",
  unitPrice: "10990",
  ...extra,
});

describe("venda de produtos", () => {
  it("descreve a venda com a quantidade quando passa de 1", () => {
    expect(
      saleDescription([
        { quantity: 1, product: { id: "a", name: "Sérum" } },
        { quantity: 2, product: { id: "b", name: "Faixa" } },
      ]),
    ).toBe("Sérum, Faixa (2)");
  });

  it("sugere o promocional quando houver", () => {
    expect(
      suggestedPrice({ salePrice: "129.9", promotionalPrice: "109.9" }),
    ).toBe("109.9");
    expect(suggestedPrice({ salePrice: "89.9", promotionalPrice: null })).toBe(
      "89.9",
    );
  });

  it("valida quantidade, estoque e valor de cada linha", () => {
    expect(validateCart([line()])).toEqual({});
    expect(validateCart([line({ quantity: "" })])).toEqual({
      p1: "Informe a quantidade.",
    });
    expect(validateCart([line({ quantity: "6" })])).toEqual({
      p1: "Há 5 em estoque.",
    });
    expect(validateCart([line({ unitPrice: "" })])).toEqual({
      p1: "Informe o valor.",
    });
  });

  it("soma o total em centavos", () => {
    expect(
      cartTotal([
        line(),
        line({ productId: "p2", quantity: "1", unitPrice: "3990" }),
      ]),
    ).toBe(259.7);
  });
});
