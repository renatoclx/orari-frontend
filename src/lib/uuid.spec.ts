import { describe, expect, it } from "vitest";
import { isUuid } from "@/lib/uuid";

describe("isUuid", () => {
  it("aceita um UUID, com maiúsculas ou minúsculas", () => {
    expect(isUuid("50b443b3-32d4-41d0-b1af-7fb7fcffdaa7")).toBe(true);
    expect(isUuid("50B443B3-32D4-41D0-B1AF-7FB7FCFFDAA7")).toBe(true);
  });

  it("recusa o que não é UUID, inclusive caminhos forjados", () => {
    for (const value of [
      "",
      "abc",
      "../users",
      "..%2F..%2Fusers",
      "50b443b3-32d4-41d0-b1af-7fb7fcffdaa7/entries",
      " 50b443b3-32d4-41d0-b1af-7fb7fcffdaa7",
    ]) {
      expect(isUuid(value)).toBe(false);
    }
  });
});
