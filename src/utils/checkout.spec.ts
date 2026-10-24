import { describe, expect, it } from "vitest";
import type { CheckoutAppointment, CheckoutItem } from "@/types/payment";
import { checkoutState } from "@/utils/checkout";

type AppointmentPayment = NonNullable<CheckoutAppointment["payment"]>;
type PreviousPayment = CheckoutItem["previousPayments"][number];

function appointment(
  payment: Pick<AppointmentPayment, "status"> | null,
  clientPlanId: string | null = null,
): CheckoutAppointment {
  return {
    id: "a1",
    startAt: "2026-10-23T22:30:00.000Z",
    status: "SCHEDULED",
    service: { id: "s1", name: "Limpeza de Pele" },
    professional: { id: "p1", name: "Helena" },
    recurringAppointmentId: null,
    clientPlanId,
    payment: payment as AppointmentPayment | null,
  };
}

const previous = (status: "PENDING" | "PAID") =>
  ({ status }) as PreviousPayment;

function checkout(
  appointments: CheckoutAppointment[],
  options: {
    previousPayments?: PreviousPayment[];
    todayPending?: string;
    previousPending?: string;
  } = {},
): CheckoutItem {
  return {
    client: { id: "c1", name: "Camila" },
    appointments,
    previousPayments: options.previousPayments ?? [],
    todayPending: options.todayPending ?? "0.00",
    previousPending: options.previousPending ?? "0.00",
    paidToday: "0.00",
  };
}

describe("checkoutState", () => {
  it("atendimento de hoje sem pagamento aguarda conclusão (não é Paga)", () => {
    expect(checkoutState(checkout([appointment(null)]))).toBe("awaiting");
  });

  it("só sessão de pacote é incluída no pacote", () => {
    expect(checkoutState(checkout([appointment(null, "plan-1")]))).toBe(
      "package",
    );
  });

  it("pendência de hoje deixa a comanda aberta", () => {
    expect(
      checkoutState(
        checkout([appointment({ status: "PENDING" })], {
          todayPending: "160.00",
        }),
      ),
    ).toBe("open");
  });

  it("pendência anterior deixa a comanda aberta", () => {
    expect(
      checkoutState(
        checkout([appointment({ status: "PAID" })], {
          previousPayments: [previous("PENDING")],
          previousPending: "494.00",
        }),
      ),
    ).toBe("open");
  });

  it("tudo pago é Paga", () => {
    expect(checkoutState(checkout([appointment({ status: "PAID" })]))).toBe(
      "paid",
    );
  });

  it("um pago e outro sem pagamento ainda aguarda conclusão", () => {
    expect(
      checkoutState(
        checkout([appointment({ status: "PAID" }), appointment(null)]),
      ),
    ).toBe("awaiting");
  });

  it("um pago e outro pendente é aberta", () => {
    expect(
      checkoutState(
        checkout(
          [appointment({ status: "PAID" }), appointment({ status: "PENDING" })],
          { todayPending: "160.00" },
        ),
      ),
    ).toBe("open");
  });

  it("só pagamentos anteriores pagos hoje (sem atendimento) é Paga", () => {
    expect(
      checkoutState(checkout([], { previousPayments: [previous("PAID")] })),
    ).toBe("paid");
  });

  it("sessão de pacote com pagamento anterior pago é Paga", () => {
    expect(
      checkoutState(
        checkout([appointment(null, "plan-1")], {
          previousPayments: [previous("PAID")],
        }),
      ),
    ).toBe("paid");
  });

  it("comanda vazia não quebra e não é Paga", () => {
    expect(checkoutState(checkout([]))).toBe("awaiting");
  });
});
