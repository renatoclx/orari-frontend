import { describe, expect, it } from "vitest";
import {
  centsText,
  initialProductValues,
  maskStock,
  productErrorField,
  toProductInput,
  validateProductForm,
  type ProductFormValues,
} from "@/components/products/product-validation";
import {
  formatMargin,
  isNegativeMargin,
  profitMargin,
} from "@/components/products/product-pricing";

const valid: ProductFormValues = {
  ...initialProductValues(),
  name: "Óleo de massagem",
  categoryId: "c1",
  salePrice: "10000",
  purchasePrice: "6000",
  currentStock: "10",
};

describe("validateProductForm", () => {
  it("aceita o mínimo obrigatório", () => {
    expect(validateProductForm(valid)).toEqual({});
  });

  it("exige nome, categoria, preços e estoque atual", () => {
    const errors = validateProductForm(initialProductValues());
    expect(Object.keys(errors).sort()).toEqual(
      [
        "categoryId",
        "currentStock",
        "name",
        "purchasePrice",
        "salePrice",
      ].sort(),
    );
  });

  it("estoque atual 0 vale", () => {
    expect(validateProductForm({ ...valid, currentStock: "0" })).toEqual({});
  });

  it("promocional igual ou acima da venda é recusado", () => {
    expect(
      validateProductForm({ ...valid, promotionalPrice: "10000" })
        .promotionalPrice,
    ).toBeDefined();
    expect(validateProductForm({ ...valid, promotionalPrice: "9000" })).toEqual(
      {},
    );
  });

  it("mínimo acima do máximo é recusado; igual vale", () => {
    expect(
      validateProductForm({ ...valid, minimalStock: "5", maximumStock: "4" })
        .minimalStock,
    ).toBeDefined();
    expect(
      validateProductForm({ ...valid, minimalStock: "4", maximumStock: "4" }),
    ).toEqual({});
  });
});

describe("toProductInput", () => {
  it("centavos viram reais e opcionais vazios viram null", () => {
    expect(toProductInput({ ...valid, description: "  " })).toEqual({
      name: "Óleo de massagem",
      description: null,
      sku: null,
      categoryId: "c1",
      supplierId: null,
      measureUnit: null,
      salePrice: 100,
      purchasePrice: 60,
      promotionalPrice: null,
      currentStock: 10,
      minimalStock: null,
      maximumStock: null,
    });
  });

  it("não manda a margem", () => {
    expect(toProductInput(valid)).not.toHaveProperty("profitMargin");
  });
});

describe("campos", () => {
  it("centsText converte o texto da API", () => {
    expect(centsText("37.5")).toBe("3750");
    expect(centsText("100")).toBe("10000");
    expect(centsText(null)).toBe("");
  });

  it("maskStock deixa só dígitos e mantém o zero", () => {
    expect(maskStock("0")).toBe("0");
    expect(maskStock("007")).toBe("7");
    expect(maskStock("1,5")).toBe("15");
  });

  it("erros da API vão para o campo certo", () => {
    expect(
      productErrorField("Já existe um produto com este SKU na empresa"),
    ).toBe("sku");
    expect(productErrorField("A categoria de produto está inativa")).toBe(
      "categoryId",
    );
    expect(
      productErrorField(
        "O fornecedor precisa ser uma pessoa ativa do tipo SUPPLIER",
      ),
    ).toBe("supplierId");
    expect(
      productErrorField(
        "O preço promocional precisa ser menor que o preço de venda",
      ),
    ).toBe("promotionalPrice");
    expect(
      productErrorField("O estoque mínimo não pode passar do estoque máximo"),
    ).toBe("minimalStock");
    expect(productErrorField("Erro qualquer")).toBeUndefined();
  });
});

describe("margem", () => {
  it("calcula sobre a venda, com duas casas", () => {
    expect(profitMargin(100, 60)).toBe(40);
    expect(profitMargin(80, 50)).toBe(37.5);
    expect(profitMargin(30, 20)).toBe(33.33);
    expect(profitMargin(100, 120)).toBe(-20);
    expect(profitMargin(0, 10)).toBeNull();
  });

  it("formata e destaca a negativa", () => {
    expect(formatMargin("37.5")).toBe("37,5%");
    expect(formatMargin("40")).toBe("40%");
    expect(isNegativeMargin("-20")).toBe(true);
    expect(isNegativeMargin("0")).toBe(false);
  });
});
