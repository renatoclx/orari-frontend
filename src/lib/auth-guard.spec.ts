import { describe, expect, it } from "vitest";
import { isAuthGuardEnabled } from "@/lib/auth-guard";

describe("isAuthGuardEnabled", () => {
  it("fica ligada por padrão", () => {
    expect(isAuthGuardEnabled({})).toBe(true);
    expect(isAuthGuardEnabled({ NODE_ENV: "development" })).toBe(true);
  });

  it("AUTH_GUARD=off desliga só fora de produção", () => {
    expect(isAuthGuardEnabled({ AUTH_GUARD: "off" })).toBe(false);
    expect(
      isAuthGuardEnabled({ AUTH_GUARD: "off", NODE_ENV: "development" }),
    ).toBe(false);
  });

  it("em produção, ignora AUTH_GUARD=off", () => {
    expect(
      isAuthGuardEnabled({ AUTH_GUARD: "off", NODE_ENV: "production" }),
    ).toBe(true);
  });

  it("outros valores não desligam", () => {
    expect(isAuthGuardEnabled({ AUTH_GUARD: "false" })).toBe(true);
    expect(isAuthGuardEnabled({ AUTH_GUARD: "OFF" })).toBe(true);
  });
});
