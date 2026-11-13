import { describe, expect, it } from "vitest";
import { hasPending, pendingTiles } from "./pending-today";

const summary = {
  date: "2026-11-13",
  items: [
    { item: "PAYABLE_TODAY" as const, count: 3 },
    { item: "PAYABLE_OVERDUE" as const, count: 0 },
    { item: "RECEIVABLE_OVERDUE" as const, count: 5 },
    { item: "OPEN_TABS" as const, count: 2 },
    { item: "BIRTHDAYS" as const, count: 1 },
  ],
};

describe("pendingTiles", () => {
  const tiles = pendingTiles(summary);

  it("mantém a ordem e o número de cada item", () => {
    expect(tiles.map((tile) => [tile.label, tile.count])).toEqual([
      ["Contas a pagar hoje", 3],
      ["Contas atrasadas", 0],
      ["Recebimentos atrasados", 5],
      ["Comandas do dia", 2],
      ["Aniversariantes", 1],
    ]);
  });

  it("cada quadro leva à tela já filtrada", () => {
    expect(tiles[0].href).toBe(
      "/financeiro/contas-a-pagar?status=pendentes&de=2026-11-13&ate=2026-11-13",
    );
    expect(tiles[1].href).toBe("/financeiro/contas-a-pagar?status=atrasadas");
    expect(tiles[2].href).toBe("/financeiro?status=atrasados");
    expect(tiles[3].href).toBe("/financeiro/comandas");
  });
});

describe("hasPending", () => {
  it("diz se algum item tem número", () => {
    expect(hasPending(pendingTiles(summary))).toBe(true);
    expect(
      hasPending(
        pendingTiles({
          date: "2026-11-13",
          items: [{ item: "BIRTHDAYS", count: 0 }],
        }),
      ),
    ).toBe(false);
  });
});
