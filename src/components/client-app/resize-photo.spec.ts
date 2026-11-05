import { describe, expect, it } from "vitest";
import { fitInside } from "@/components/client-app/resize-photo";

describe("fitInside", () => {
  it("reduz pelo lado maior, mantendo a proporção", () => {
    expect(fitInside(4032, 3024)).toEqual({ width: 960, height: 720 });
    expect(fitInside(3024, 4032)).toEqual({ width: 720, height: 960 });
  });

  it("foto pequena não aumenta", () => {
    expect(fitInside(400, 300)).toEqual({ width: 400, height: 300 });
  });
});
