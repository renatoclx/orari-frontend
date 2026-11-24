import { describe, expect, it } from "vitest";
import {
  overduePaymentsHref,
  receivablesQuery,
} from "@/components/receivables/receivables-filters";

const month = { from: "2026-11-01", to: "2026-11-30" };
const none = { from: "", to: "", search: "" };

describe("receivablesQuery", () => {
  it("o mês atual fica fora da URL", () => {
    expect(
      receivablesQuery(
        { ...none, from: month.from, to: month.to },
        month,
      ).toString(),
    ).toBe("");
  });

  it("outro período vai com as duas datas; a busca, sem espaços", () => {
    expect(
      receivablesQuery({ ...none, ...month }, month, {
        from: "2026-10-01",
        search: "  Ana ",
      }).toString(),
    ).toBe("de=2026-10-01&ate=2026-11-30&q=Ana");
  });
});

describe("overduePaymentsHref", () => {
  it("leva aos atrasados em Pagamentos, do cliente se houver", () => {
    expect(overduePaymentsHref()).toBe("/pagamentos?status=atrasados");
    expect(overduePaymentsHref("c-1")).toBe(
      "/pagamentos?status=atrasados&cliente=c-1",
    );
  });
});
