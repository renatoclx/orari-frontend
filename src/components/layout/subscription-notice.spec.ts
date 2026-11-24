import { describe, expect, it } from "vitest";
import { subscriptionNotice } from "@/components/layout/subscription-notice";
import { withReadOnlyAccess } from "@/utils/access";

describe("subscriptionNotice", () => {
  const trial = {
    status: "TRIAL" as const,
    readOnly: false,
    endsAt: "2026-12-06",
  };

  it("sem assinatura ou ativa: sem aviso", () => {
    expect(subscriptionNotice(null, "2026-12-01")).toBeNull();
    expect(
      subscriptionNotice(
        { status: "ACTIVE", readOnly: false, endsAt: "2027-01-01" },
        "2026-12-01",
      ),
    ).toBeNull();
  });

  it("em teste: os dias que faltam e o último dia", () => {
    expect(subscriptionNotice(trial, "2026-12-01")?.message).toBe(
      "Seu teste grátis termina em 5 dias.",
    );
    expect(subscriptionNotice(trial, "2026-12-05")?.message).toBe(
      "Seu teste grátis termina em 1 dia.",
    );
    expect(subscriptionNotice(trial, "2026-12-06")?.message).toBe(
      "Hoje é o último dia do seu teste grátis.",
    );
  });

  it("em atraso: o dia em que vira somente leitura", () => {
    expect(
      subscriptionNotice(
        { status: "OVERDUE", readOnly: false, endsAt: "2026-12-31" },
        "2026-12-28",
      ),
    ).toMatchObject({
      tone: "alert",
      message: expect.stringContaining("A partir de 01/01") as string,
    });
  });

  it("somente leitura e cancelada: alerta", () => {
    expect(
      subscriptionNotice(
        { status: "READ_ONLY", readOnly: true, endsAt: null },
        "2026-12-28",
      )?.kind,
    ).toBe("readOnly");
    expect(
      subscriptionNotice(
        { status: "CANCELED", readOnly: true, endsAt: null },
        "2026-12-28",
      )?.message,
    ).toContain("cancelada");
  });
});

describe("withReadOnlyAccess", () => {
  const access = {
    features: [
      {
        feature: "clients",
        view: true,
        edit: true,
        create: true,
        remove: true,
      },
    ],
  };

  it("somente leitura: fica só o Visualiza", () => {
    const user = withReadOnlyAccess({
      access,
      subscription: { status: "READ_ONLY", readOnly: true, endsAt: null },
    });
    expect(user.access.features[0]).toEqual({
      feature: "clients",
      view: true,
      edit: false,
      create: false,
      remove: false,
    });
  });

  it("gravando normalmente: devolve o mesmo usuário", () => {
    const user = { access, subscription: null };
    expect(withReadOnlyAccess(user)).toBe(user);
  });
});
