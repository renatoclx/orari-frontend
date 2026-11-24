import { describe, expect, it } from "vitest";
import {
  changeDate,
  monthOf,
  portfolioQuery,
  type PortfolioFiltersState,
} from "./portfolio-filters";

const month = { from: "2026-11-01", to: "2026-11-30" };
const base: PortfolioFiltersState = {
  professional: "p-1",
  from: "",
  to: "",
  status: "todas",
  search: "",
};

describe("monthOf", () => {
  it("primeiro e último dia do mês", () => {
    expect(monthOf("2026-11-09")).toEqual(month);
    expect(monthOf("2028-02-10")).toEqual({
      from: "2028-02-01",
      to: "2028-02-29",
    });
  });
});

describe("portfolioQuery", () => {
  it("deixa o padrão de fora", () => {
    expect(portfolioQuery(base, month).toString()).toBe("profissional=p-1");
  });

  it("período fora do mês atual vai com as duas datas", () => {
    expect(
      portfolioQuery(base, month, {
        from: "2026-10-01",
        to: "2026-10-31",
      }).toString(),
    ).toBe("profissional=p-1&de=2026-10-01&ate=2026-10-31");
  });

  it("o mês atual escrito por extenso também fica de fora", () => {
    expect(portfolioQuery({ ...base, ...month }, month).has("de")).toBe(false);
  });

  it("situação e busca", () => {
    expect(
      portfolioQuery(base, month, {
        status: "sem-retorno",
        search: " ana ",
      }).toString(),
    ).toBe("profissional=p-1&situacao=sem-retorno&q=ana");
  });
});

describe("changeDate", () => {
  it("leva a outra data do mês atual junto", () => {
    expect(changeDate(base, month, "from", "2026-11-10")).toEqual({
      from: "2026-11-10",
      to: "2026-11-30",
    });
  });

  it("início depois do fim: o fim acompanha (e o contrário)", () => {
    expect(changeDate(base, month, "from", "2026-12-05")).toEqual({
      from: "2026-12-05",
      to: "2026-12-05",
    });
    expect(changeDate(base, month, "to", "2026-10-20")).toEqual({
      from: "2026-10-20",
      to: "2026-10-20",
    });
  });

  it("data apagada volta ao mês atual", () => {
    expect(
      changeDate(
        { ...base, from: "2026-10-01", to: "2026-10-31" },
        month,
        "to",
        "",
      ),
    ).toEqual({ from: "", to: "" });
  });
});
