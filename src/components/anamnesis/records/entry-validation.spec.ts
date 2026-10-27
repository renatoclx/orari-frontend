import { describe, expect, it } from "vitest";
import {
  EVOLUTION_MAX,
  validateEntryForm,
} from "@/components/anamnesis/records/entry-validation";

const ok = {
  evolution: "Melhorou",
  consultationDate: "2026-10-25",
  appointmentId: "",
};

describe("validateEntryForm", () => {
  const today = "2026-10-27";
  const initial = "2026-10-20";

  it("aceita um acompanhamento válido", () => {
    expect(validateEntryForm(ok, today, initial)).toEqual({});
  });

  it("exige a evolução e respeita o limite", () => {
    expect(
      validateEntryForm({ ...ok, evolution: "   " }, today, initial).evolution,
    ).toBeTruthy();
    expect(
      validateEntryForm(
        { ...ok, evolution: "a".repeat(EVOLUTION_MAX + 1) },
        today,
        initial,
      ).evolution,
    ).toBeTruthy();
    expect(
      validateEntryForm(
        { ...ok, evolution: "a".repeat(EVOLUTION_MAX) },
        today,
        initial,
      ).evolution,
    ).toBeUndefined();
  });

  it("recusa data futura e anterior ao registro inicial, aceita os limites", () => {
    const date = (consultationDate: string) =>
      validateEntryForm({ ...ok, consultationDate }, today, initial)
        .consultationDate;
    expect(date("2026-10-28")).toMatch(/futura/);
    expect(date("2026-10-19")).toMatch(/anterior/);
    expect(date("2026-10-27")).toBeUndefined();
    expect(date("2026-10-20")).toBeUndefined();
    expect(date("")).toBeTruthy();
  });
});
