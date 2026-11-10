import { describe, expect, it } from "vitest";
import {
  rankingsQuery,
  readRankingsFilters,
} from "@/components/rankings/rankings-filters";

const month = { from: "2026-11-01", to: "2026-11-30" };

describe("readRankingsFilters", () => {
  it("ordem desconhecida vira faturamento", () => {
    expect(readRankingsFilters({ ordem: "x" })).toEqual({
      filters: { from: "", to: "", sort: "faturamento" },
      sort: "amount",
    });
  });

  it("quantidade e período válidos", () => {
    expect(
      readRankingsFilters({
        ordem: "quantidade",
        de: "2026-10-01",
        ate: "2026-10-31",
      }),
    ).toEqual({
      filters: { from: "2026-10-01", to: "2026-10-31", sort: "quantidade" },
      sort: "count",
    });
  });
});

describe("rankingsQuery", () => {
  it("o padrão fica fora da URL", () => {
    expect(
      rankingsQuery(
        { from: "", to: "", sort: "faturamento" },
        month,
      ).toString(),
    ).toBe("");
  });

  it("ordem e período", () => {
    expect(
      rankingsQuery({ from: "", to: "", sort: "faturamento" }, month, {
        sort: "quantidade",
        to: "2026-12-15",
      }).toString(),
    ).toBe("de=2026-11-01&ate=2026-12-15&ordem=quantidade");
  });
});
