import { describe, expect, it } from "vitest";
import {
  ALL,
  DEFAULT_PAYMENT_FILTER,
  PAYMENT_FILTERS,
  paymentQuery,
  type PaymentFiltersState,
} from "@/components/payments/payment-filters";

const defaults: PaymentFiltersState = {
  status: DEFAULT_PAYMENT_FILTER,
  from: "",
  to: "",
  client: ALL,
  method: ALL,
};

describe("PAYMENT_FILTERS", () => {
  it("o padrão é pendentes (atrasados e a vencer juntos)", () => {
    expect(DEFAULT_PAYMENT_FILTER).toBe("pendentes");
    const pending = PAYMENT_FILTERS.find((f) => f.id === "pendentes");
    expect(pending).toMatchObject({ status: "PENDING" });
    expect(pending).not.toHaveProperty("overdue");
  });

  it("atrasados e a vencer separam os pendentes pelo vencimento", () => {
    expect(PAYMENT_FILTERS.find((f) => f.id === "atrasados")).toMatchObject({
      status: "PENDING",
      overdue: true,
    });
    expect(PAYMENT_FILTERS.find((f) => f.id === "a-vencer")).toMatchObject({
      status: "PENDING",
      overdue: false,
    });
  });

  it("pagos e cancelados usam o status da API; todos não filtra", () => {
    expect(PAYMENT_FILTERS.find((f) => f.id === "pagos")?.status).toBe("PAID");
    expect(PAYMENT_FILTERS.find((f) => f.id === "cancelados")?.status).toBe(
      "CANCELLED",
    );
    expect(PAYMENT_FILTERS.find((f) => f.id === "todos")?.status).toBe(
      undefined,
    );
  });

  it("os ids são únicos", () => {
    const ids = PAYMENT_FILTERS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("paymentQuery", () => {
  it("o padrão não gera parâmetros (URL limpa)", () => {
    expect(paymentQuery(defaults).toString()).toBe("");
  });

  it("só entra o que foge do padrão", () => {
    const query = paymentQuery({
      ...defaults,
      status: "pagos",
      from: "2026-10-01",
      to: "2026-10-31",
      client: "c1",
      method: "m1",
    });

    expect(Object.fromEntries(query)).toEqual({
      status: "pagos",
      de: "2026-10-01",
      ate: "2026-10-31",
      cliente: "c1",
      metodo: "m1",
    });
  });

  it("o valor 'all' do cliente e do método sai da URL", () => {
    expect(paymentQuery({ ...defaults, client: ALL, method: ALL }).size).toBe(
      0,
    );
  });

  it("os overrides trocam só o que foi pedido", () => {
    const query = paymentQuery(
      { ...defaults, client: "c1", from: "2026-10-01" },
      { status: "atrasados" },
    );

    expect(Object.fromEntries(query)).toEqual({
      status: "atrasados",
      cliente: "c1",
      de: "2026-10-01",
    });
  });

  it("override de volta ao padrão tira o parâmetro", () => {
    const query = paymentQuery(
      { ...defaults, status: "pagos" },
      { status: DEFAULT_PAYMENT_FILTER },
    );

    expect(query.has("status")).toBe(false);
  });

  it("limpar uma data tira o parâmetro", () => {
    const query = paymentQuery(
      { ...defaults, from: "2026-10-01" },
      { from: "" },
    );

    expect(query.has("de")).toBe(false);
  });
});
