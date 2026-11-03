import { describe, expect, it } from "vitest";
import { layoutLanes } from "@/components/agenda/block-lanes";

const at = (key: string, start: string, end: string) => ({
  key,
  range: { start, end },
});

describe("layoutLanes", () => {
  it("bloco sozinho ocupa a coluna inteira", () => {
    expect(layoutLanes([at("a", "09:00", "09:50")]).get("a")).toEqual({
      lane: 0,
      lanes: 1,
    });
  });

  it("dois blocos no mesmo horário dividem a coluna ao meio", () => {
    const lanes = layoutLanes([
      at("a", "09:00", "09:50"),
      at("b", "09:00", "09:50"),
    ]);
    expect(lanes.get("a")).toEqual({ lane: 0, lanes: 2 });
    expect(lanes.get("b")).toEqual({ lane: 1, lanes: 2 });
  });

  it("horários que só se encostam não dividem", () => {
    const lanes = layoutLanes([
      at("a", "09:00", "10:00"),
      at("b", "10:00", "11:00"),
    ]);
    expect(lanes.get("a")).toEqual({ lane: 0, lanes: 1 });
    expect(lanes.get("b")).toEqual({ lane: 0, lanes: 1 });
  });

  it("um bloco longo ao lado de dois curtos: o segundo reaproveita a faixa", () => {
    const lanes = layoutLanes([
      at("long", "09:00", "11:00"),
      at("a", "09:00", "10:00"),
      at("b", "10:00", "11:00"),
    ]);
    // Duas faixas no total; os curtos usam a mesma, e o longo, a outra.
    expect(lanes.get("long")?.lanes).toBe(2);
    expect(lanes.get("a")?.lanes).toBe(2);
    expect(lanes.get("a")?.lane).toBe(lanes.get("b")?.lane);
    expect(lanes.get("a")?.lane).not.toBe(lanes.get("long")?.lane);
  });

  it("grupos separados não influenciam um ao outro", () => {
    const lanes = layoutLanes([
      at("a", "09:00", "09:50"),
      at("b", "09:00", "09:50"),
      at("c", "14:00", "14:50"),
    ]);
    expect(lanes.get("a")?.lanes).toBe(2);
    expect(lanes.get("c")).toEqual({ lane: 0, lanes: 1 });
  });

  it("sem blocos, nada a posicionar", () => {
    expect(layoutLanes([]).size).toBe(0);
  });
});
