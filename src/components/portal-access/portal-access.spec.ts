import { describe, expect, it } from "vitest";
import {
  accessMessage,
  whatsAppLink,
} from "@/components/portal-access/portal-access";

describe("accessMessage", () => {
  it("usa o primeiro nome, a clínica, o link e a validade", () => {
    const message = accessMessage(
      "  Beatriz Nogueira ",
      "Studio Aurora",
      "https://x/app/acesso/t",
    );
    expect(message).toMatch(/^Olá, Beatriz!/);
    expect(message).toContain("Studio Aurora");
    expect(message).toContain("https://x/app/acesso/t");
    expect(message).toContain("24 horas");
  });
});

describe("whatsAppLink", () => {
  it("abre a conversa com o telefone (com 55) e a mensagem codificada", () => {
    expect(whatsAppLink("31988887777", "Olá & tchau")).toBe(
      "https://wa.me/5531988887777?text=Ol%C3%A1%20%26%20tchau",
    );
  });

  it("sem telefone válido, abre só a mensagem", () => {
    expect(whatsAppLink(null, "oi")).toBe("https://wa.me/?text=oi");
    expect(whatsAppLink("123", "oi")).toBe("https://wa.me/?text=oi");
  });
});
