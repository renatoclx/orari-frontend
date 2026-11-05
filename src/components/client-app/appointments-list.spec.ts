import { describe, expect, it } from "vitest";
import {
  cannotCancelReason,
  filterByPlace,
  kindLabel,
  pastStatusLabel,
} from "@/components/client-app/appointments-list";
import type { AppAppointment } from "@/types/client-app";

const item = (overrides: Partial<AppAppointment> = {}): AppAppointment => ({
  id: "a-1",
  startAt: "2026-11-12T11:00:00.000Z",
  endAt: "2026-11-12T12:00:00.000Z",
  status: "SCHEDULED",
  kind: "SINGLE",
  service: { name: "Drenagem", duration: 60 },
  professional: { name: "Camila" },
  canCancel: true,
  place: {
    slug: "aurora",
    name: "Studio Aurora",
    logoUrl: null,
    timezone: "America/Sao_Paulo",
  },
  ...overrides,
});

describe("pastStatusLabel", () => {
  it("dá nome às situações de quem já passou", () => {
    expect(pastStatusLabel("COMPLETED")).toBe("Concluído");
    expect(pastStatusLabel("CANCELLED")).toBe("Cancelado");
    expect(pastStatusLabel("NO_SHOW")).toBe("Não compareceu");
    expect(pastStatusLabel("SCHEDULED")).toBeUndefined();
  });
});

describe("kindLabel", () => {
  it("avulso não tem rótulo; os demais, sim", () => {
    expect(kindLabel("SINGLE")).toBeUndefined();
    expect(kindLabel("PLAN")).toBe("Pacote");
    expect(kindLabel("CLASS")).toBe("Turma");
    expect(kindLabel("RECURRENCE")).toBe("Horário fixo");
  });
});

describe("cannotCancelReason", () => {
  it("cancelável: sem motivo", () => {
    expect(cannotCancelReason(item())).toBeUndefined();
  });

  it("pacote, turma ou recorrência: com a clínica", () => {
    expect(cannotCancelReason(item({ kind: "PLAN", canCancel: false }))).toBe(
      "Para cancelar ou remarcar, fale com o estabelecimento.",
    );
  });

  it("avulso fora do prazo", () => {
    expect(cannotCancelReason(item({ canCancel: false }))).toBe(
      "Fora do prazo para cancelar pelo app. Fale com o estabelecimento.",
    );
  });
});

describe("filterByPlace", () => {
  it("filtra pelo estabelecimento; sem filtro, todos", () => {
    const items = [
      item(),
      item({ id: "a-2", place: { ...item().place, slug: "zeta" } }),
    ];
    expect(filterByPlace(items, "zeta").map((i) => i.id)).toEqual(["a-2"]);
    expect(filterByPlace(items, undefined)).toHaveLength(2);
  });
});
