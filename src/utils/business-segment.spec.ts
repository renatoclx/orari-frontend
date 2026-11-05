import { describe, expect, it } from "vitest";
import { BUSINESS_SEGMENTS, segmentLabel } from "@/utils/business-segment";

describe("business-segment", () => {
  it("tem os 11 segmentos, com Outros por último", () => {
    expect(BUSINESS_SEGMENTS).toHaveLength(11);
    expect(BUSINESS_SEGMENTS.at(-1)).toEqual({
      value: "OTHER",
      label: "Outros",
    });
  });

  it("dá o nome em português", () => {
    expect(segmentLabel("NAIL_SALON")).toBe("Esmalteria");
    expect(segmentLabel("EYEBROW_DESIGN")).toBe("Design de sobrancelhas");
  });
});
