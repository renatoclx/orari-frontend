import type { ProductUnit } from "@/types/product";

/** Unidades de medida da API, por extenso, na ordem do campo de escolha. */
export const PRODUCT_UNITS: { value: ProductUnit; label: string }[] = [
  { value: "UN", label: "Unidade" },
  { value: "CX", label: "Caixa" },
  { value: "PCT", label: "Pacote" },
  { value: "KG", label: "Quilograma (kg)" },
  { value: "G", label: "Grama (g)" },
  { value: "L", label: "Litro (L)" },
  { value: "ML", label: "Mililitro (mL)" },
  { value: "M", label: "Metro (m)" },
];

export function unitLabel(unit: ProductUnit | null): string | null {
  return PRODUCT_UNITS.find((item) => item.value === unit)?.label ?? null;
}

export function isProductUnit(value: string): value is ProductUnit {
  return PRODUCT_UNITS.some((item) => item.value === value);
}
