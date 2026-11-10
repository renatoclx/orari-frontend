import { describe, expect, it } from "vitest";
import {
  ALL,
  payableQuery,
  payableTitle,
  readPayableFilters,
} from "@/components/payables/payable-filters";

describe("filtros do Contas a pagar", () => {
  it("lê a URL ignorando o inválido; o padrão fica fora", () => {
    const filters = readPayableFilters({ status: "x", de: "2026-13-40" });
    expect(filters).toEqual({
      status: "pendentes",
      from: "",
      to: "",
      payee: ALL,
      category: ALL,
    });
    expect(payableQuery(filters).toString()).toBe("");
  });

  it("monta a URL com situação, período, favorecido e categoria", () => {
    expect(
      payableQuery(readPayableFilters({}), {
        status: "atrasadas",
        from: "2026-11-01",
        payee: "p1",
        category: "c1",
      }).toString(),
    ).toBe("status=atrasadas&de=2026-11-01&favorecido=p1&categoria=c1");
  });

  it("título com a parcela", () => {
    expect(
      payableTitle({
        description: "Aluguel",
        installment: 11,
        installments: 12,
      }),
    ).toBe("Aluguel (11/12)");
    expect(
      payableTitle({
        description: "Energia",
        installment: null,
        installments: null,
      }),
    ).toBe("Energia");
  });
});
