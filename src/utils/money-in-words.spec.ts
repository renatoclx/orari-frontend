import { describe, expect, it } from "vitest";
import { moneyInWords } from "@/utils/money-in-words";

describe("moneyInWords", () => {
  it.each([
    ["18.00", "dezoito reais"],
    [1, "um real"],
    ["0.50", "cinquenta centavos"],
    ["0.01", "um centavo"],
    ["18.50", "dezoito reais e cinquenta centavos"],
    [21, "vinte e um reais"],
    [100, "cem reais"],
    [101, "cento e um reais"],
    [250, "duzentos e cinquenta reais"],
    [1000, "mil reais"],
    [1001, "mil e um reais"],
    [1200, "mil e duzentos reais"],
    [1250, "mil duzentos e cinquenta reais"],
    [2000000, "dois milhões de reais"],
    [1000000, "um milhão de reais"],
    [
      "1234.56",
      "mil duzentos e trinta e quatro reais e cinquenta e seis centavos",
    ],
  ])("%s → %s", (value, words) => {
    expect(moneyInWords(value)).toBe(words);
  });
});
