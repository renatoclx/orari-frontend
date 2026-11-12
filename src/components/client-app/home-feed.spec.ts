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
  it("marcados primeiro (o mais próximo antes), depois o passado mais recente, por fim os sem agendamento", () => {
    const places = [
      place("sem"),
      place("passado-antigo"),
      place("longe"),
      place("amanha"),
      place("passado-recente"),
      place("nunca"),
    ];
    const result = recentPlaces(
      places,
      [
        appointment("1", "2026-11-18T15:00:00Z", "longe"),
        appointment("2", "2026-11-13T15:00:00Z", "amanha"),
        appointment("3", "2026-11-20T15:00:00Z", "amanha"),
      ],
      [
        appointment("4", "2026-10-01T15:00:00Z", "passado-antigo"),
        appointment("5", "2026-11-05T15:00:00Z", "passado-recente"),
      ],
    );
    expect(result.map((item) => item.slug)).toEqual([
      "amanha",
      "longe",
      "passado-recente",
      "passado-antigo",
      "sem",
      "nunca",
    ]);
  });

  it("cancelado não conta", () => {
    const result = recentPlaces(
      [place("a"), place("b")],
      [appointment("1", "2026-11-13T15:00:00Z", "b", "CANCELLED")],
      [appointment("2", "2026-11-01T15:00:00Z", "a")],
    );
    expect(result.map((item) => item.slug)).toEqual(["a", "b"]);
  });
});
