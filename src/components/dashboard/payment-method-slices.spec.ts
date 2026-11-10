import { describe, expect, it } from "vitest";
import { methodSlices } from "@/components/dashboard/payment-method-slices";

const method = (id: string | null, amount: number, count = 1) => ({
  id,
  name: id ? id.toUpperCase() : null,
  amount: amount.toFixed(2),
  count,
  share: amount / 1000,
});

describe("methodSlices", () => {
  const order = ["a", "b", "c", "d", "e", "f"];

  it("a cor segue a ordem do cadastro, não o valor", () => {
    const slices = methodSlices([method("c", 600), method("a", 100)], order);
    expect(slices.map((slice) => [slice.key, slice.color])).toEqual([
      ["c", "var(--chart-cat-3)"],
      ["a", "var(--chart-cat-1)"],
    ]);
  });

  it("sexto método e sem método somam em Outros, no fim", () => {
    const slices = methodSlices(
      [method("f", 300, 2), method("b", 200), method(null, 100)],
      order,
    );
    expect(slices.at(-1)).toEqual({
      key: "outros",
      label: "Outros",
      amount: 400,
      count: 3,
      share: 0.4,
      color: "var(--muted-foreground)",
    });
    expect(slices).toHaveLength(2);
  });
});
