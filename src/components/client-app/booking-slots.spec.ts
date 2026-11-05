import { describe, expect, it } from "vitest";
import {
  groupSlotsByPeriod,
  slotsLabel,
} from "@/components/client-app/booking-slots";

const slot = (time: string) => ({ time, startAt: `2026-11-12T${time}:00Z` });

describe("groupSlotsByPeriod", () => {
  it("separa manhã, tarde e noite e deixa de fora o período vazio", () => {
    const groups = groupSlotsByPeriod([
      slot("08:00"),
      slot("11:45"),
      slot("12:00"),
      slot("17:59"),
    ]);
    expect(groups.map((group) => [group.label, group.slots.length])).toEqual([
      ["Manhã", 2],
      ["Tarde", 2],
    ]);
  });

  it("noite a partir das 18:00", () => {
    expect(groupSlotsByPeriod([slot("18:00")])[0].label).toBe("Noite");
  });

  it("sem horários: nenhum grupo", () => {
    expect(groupSlotsByPeriod([])).toEqual([]);
  });
});

describe("slotsLabel", () => {
  it("singular e plural", () => {
    expect(slotsLabel(1)).toBe("1 horário");
    expect(slotsLabel(13)).toBe("13 horários");
  });
});
