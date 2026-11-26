import { describe, expect, it } from "vitest";
import { dayStripDays } from "@/utils/day-strip";

describe("dayStripDays", () => {
  it("vai de 7 dias antes a 30 depois de hoje", () => {
    const days = dayStripDays("2026-11-24", "2026-11-24");
    expect(days).toHaveLength(38);
    expect(days[0]).toBe("2026-11-17");
    expect(days.at(-1)).toBe("2026-12-24");
  });

  it("dia dentro da faixa não a desloca", () => {
    expect(dayStripDays("2026-12-24", "2026-11-24")[0]).toBe("2026-11-17");
    expect(dayStripDays("2026-11-17", "2026-11-24")[0]).toBe("2026-11-17");
  });

  it("dia fora da faixa (calendário) passa a ser o centro dela", () => {
    const days = dayStripDays("2027-03-10", "2026-11-24");
    expect(days[0]).toBe("2027-03-03");
    expect(days).toContain("2027-03-10");
    expect(dayStripDays("2026-10-01", "2026-11-24")).toContain("2026-10-01");
  });
});
