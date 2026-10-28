import { describe, expect, it } from "vitest";
import { canMarkNoShow } from "@/components/agenda/appointment-rules";
import type { AppointmentStatus } from "@/types/appointment";

const TODAY = "2026-10-28";
const NOW = 10 * 60; // 10:00

const mark = (
  status: AppointmentStatus,
  date: string,
  start: string,
  now = NOW,
) => canMarkNoShow({ status, start }, date, TODAY, now);

describe("canMarkNoShow", () => {
  it("vale para o que já terminou ou está em andamento, em qualquer dia", () => {
    expect(mark("COMPLETED", "2026-10-27", "09:00")).toBe(true);
    expect(mark("IN_PROGRESS", TODAY, "09:00")).toBe(true);
    // O status basta: o job pode já ter concluído o atendimento de hoje.
    expect(mark("COMPLETED", TODAY, "09:00")).toBe(true);
  });

  it("agendado ou confirmado: só depois do horário de início (o job roda a cada 5 minutos)", () => {
    // Ontem, mesmo ainda constando como agendado.
    expect(mark("SCHEDULED", "2026-10-27", "09:00")).toBe(true);
    // Hoje, início já passou.
    expect(mark("CONFIRMED", TODAY, "09:00")).toBe(true);
    // Hoje, exatamente no início (como o backend: início <= agora).
    expect(mark("SCHEDULED", TODAY, "10:00")).toBe(true);
    // Hoje, ainda por vir.
    expect(mark("SCHEDULED", TODAY, "11:00")).toBe(false);
    // Amanhã.
    expect(mark("CONFIRMED", "2026-10-29", "08:00")).toBe(false);
  });

  it("não se marca a falta de quem já pagou (não há reembolso)", () => {
    const paid = (status: AppointmentStatus) =>
      canMarkNoShow({ status, start: "09:00", paid: true }, TODAY, TODAY, NOW);
    expect(paid("COMPLETED")).toBe(false);
    expect(paid("IN_PROGRESS")).toBe(false);
    expect(paid("SCHEDULED")).toBe(false);
    // Sem o pagamento recebido, o mesmo atendimento aceita a falta.
    expect(
      canMarkNoShow(
        { status: "COMPLETED", start: "09:00", paid: false },
        TODAY,
        TODAY,
        NOW,
      ),
    ).toBe(true);
  });

  it("cancelado e quem já faltou são estados finais", () => {
    expect(mark("CANCELLED", "2026-10-27", "09:00")).toBe(false);
    expect(mark("NO_SHOW", "2026-10-27", "09:00")).toBe(false);
  });
});
