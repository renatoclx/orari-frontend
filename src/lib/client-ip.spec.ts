import { describe, expect, it } from "vitest";
import { clientIpFrom, forwardedForHeader } from "@/lib/client-ip";

describe("clientIpFrom", () => {
  it("usa o IP quando há um só valor", () => {
    expect(clientIpFrom("203.0.113.7")).toBe("203.0.113.7");
  });

  it("usa só o primeiro valor de uma lista de proxies", () => {
    expect(clientIpFrom("203.0.113.7, 10.0.0.1, 172.18.0.2")).toBe(
      "203.0.113.7",
    );
  });

  it("ignora espaços em volta", () => {
    expect(clientIpFrom("  198.51.100.4  ,10.0.0.1")).toBe("198.51.100.4");
  });

  it("aceita IPv6, inclusive o formato misto", () => {
    expect(clientIpFrom("2001:db8::1")).toBe("2001:db8::1");
    expect(clientIpFrom("::ffff:203.0.113.7")).toBe("::ffff:203.0.113.7");
  });

  it("não devolve nada sem cabeçalho ou com valor vazio", () => {
    expect(clientIpFrom(undefined)).toBeUndefined();
    expect(clientIpFrom(null)).toBeUndefined();
    expect(clientIpFrom("")).toBeUndefined();
    expect(clientIpFrom("   ")).toBeUndefined();
    expect(clientIpFrom(", 10.0.0.1")).toBeUndefined();
  });

  it("recusa o que não tem cara de IP (lixo ou valor forjado)", () => {
    expect(clientIpFrom("unknown")).toBeUndefined();
    expect(clientIpFrom("abc")).toBeUndefined();
    expect(clientIpFrom("999.1.1.1")).toBeUndefined();
    expect(clientIpFrom("1.2.3")).toBeUndefined();
    expect(clientIpFrom("1.2.3.4.5")).toBeUndefined();
    expect(clientIpFrom("1.2.3.4\r\nX-Evil: 1")).toBeUndefined();
    expect(clientIpFrom("<script>:alert(1)")).toBeUndefined();
    expect(clientIpFrom(`${"a:".repeat(40)}1`)).toBeUndefined();
  });
});

describe("forwardedForHeader", () => {
  it("monta o cabeçalho quando há IP", () => {
    expect(forwardedForHeader("203.0.113.7")).toEqual({
      "X-Forwarded-For": "203.0.113.7",
    });
  });

  it("não monta nada sem IP", () => {
    expect(forwardedForHeader(undefined)).toEqual({});
  });
});
