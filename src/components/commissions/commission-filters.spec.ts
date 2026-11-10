import { describe, expect, it } from "vitest";
import {
  ALL_PROFESSIONALS,
  clientPaidStatus,
  commissionsQuery,
  readCommissionFilters,
} from "@/components/commissions/commission-filters";

const month = { from: "2026-11-01", to: "2026-11-30" };

describe("readCommissionFilters / commissionsQuery", () => {
  it("profissional desconhecido vira todos; o padrão fica fora da URL", () => {
    const filters = readCommissionFilters({ profissional: "x" }, ["p1"]);
    expect(filters).toEqual({
      professional: ALL_PROFESSIONALS,
      from: "",
      to: "",
    });
    expect(commissionsQuery(filters, month).toString()).toBe("");
  });

  it("profissional e outro período entram na URL", () => {
    expect(
      commissionsQuery(
        { professional: "p1", from: "2026-10-01", to: "2026-10-31" },
        month,
      ).toString(),
    ).toBe("profissional=p1&de=2026-10-01&ate=2026-10-31");
  });
});

describe("clientPaidStatus", () => {
  it("pago, parcial ou a receber", () => {
    expect(clientPaidStatus("10.00", "10.00")).toBe("Pago");
    expect(clientPaidStatus("20.00", "10.00")).toBe("Parcial");
    expect(clientPaidStatus("10.00", "0.00")).toBe("A receber");
  });
});
