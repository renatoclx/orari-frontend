import { describe, expect, it } from "vitest";
import {
  featuredAppointment,
  recentPlaces,
} from "@/components/client-app/home-feed";
import type { AppAppointment, AppPlace } from "@/types/client-app";

const place = (slug: string): AppPlace => ({
  slug,
  name: slug,
  logoUrl: null,
  timezone: "America/Sao_Paulo",
});

const appointment = (
  id: string,
  startAt: string,
  slug = "aurora",
  status: AppAppointment["status"] = "SCHEDULED",
): AppAppointment => ({
  id,
  startAt,
  endAt: startAt,
  status,
  kind: "SINGLE",
  service: { name: "Corte", duration: 30 },
  professional: { name: "Bia" },
  canCancel: true,
  place: place(slug),
});

describe("featuredAppointment", () => {
  it("prefere o próximo, o mais cedo dos marcados", () => {
    const result = featuredAppointment(
      [
        appointment("b", "2026-11-20T15:00:00Z"),
        appointment("a", "2026-11-12T15:00:00Z"),
      ],
      [appointment("p", "2026-11-01T15:00:00Z")],
    );
    expect(result).toEqual({
      kind: "next",
      appointment: expect.objectContaining({ id: "a" }),
    });
  });

  it("sem marcados, o último que aconteceu, sem os cancelados", () => {
    const result = featuredAppointment(
      [],
      [
        appointment("velho", "2026-10-01T15:00:00Z"),
        appointment("cancelado", "2026-11-05T15:00:00Z", "aurora", "CANCELLED"),
        appointment("ultimo", "2026-11-02T15:00:00Z", "aurora", "COMPLETED"),
      ],
    );
    expect(result?.kind).toBe("last");
    expect(result?.appointment.id).toBe("ultimo");
  });

  it("sem agendamentos (ou só cancelados), nada", () => {
    expect(featuredAppointment([], [])).toBeNull();
    expect(
      featuredAppointment(
        [],
        [appointment("c", "2026-11-05T15:00:00Z", "aurora", "CANCELLED")],
      ),
    ).toBeNull();
  });
});

describe("recentPlaces", () => {
  it("ordena pelo agendamento mais recente; sem agendamento vai para o fim", () => {
    const places = [
      place("sem"),
      place("antigo"),
      place("recente"),
      place("nunca"),
    ];
    const result = recentPlaces(places, [
      appointment("1", "2026-10-01T15:00:00Z", "antigo"),
      appointment("2", "2026-11-20T15:00:00Z", "recente"),
      appointment("3", "2026-09-01T15:00:00Z", "antigo"),
    ]);
    expect(result.map((item) => item.slug)).toEqual([
      "recente",
      "antigo",
      "sem",
      "nunca",
    ]);
  });
});
