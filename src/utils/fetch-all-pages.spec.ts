import { describe, expect, it, vi } from "vitest";
import { fetchAllPages } from "@/utils/fetch-all-pages";

describe("fetchAllPages", () => {
  it("busca até completar o total", async () => {
    const load = vi.fn(async (page: number, limit: number) => ({
      items: Array.from({ length: page < 3 ? limit : 5 }, (_, i) => i),
      total: 205,
      page,
      limit,
    }));
    await expect(fetchAllPages(load)).resolves.toHaveLength(205);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("para numa página vazia", async () => {
    const load = vi.fn(async (page: number, limit: number) => ({
      items: [],
      total: 10,
      page,
      limit,
    }));
    await expect(fetchAllPages(load)).resolves.toEqual([]);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
