import { describe, expect, it } from "vitest";
import { campaignErrors, clientsLabel } from "./campaign";

describe("campaignErrors", () => {
  it("título e mensagem obrigatórios", () => {
    expect(campaignErrors({ title: " ", body: "" })).toEqual({
      title: "Escreva o título.",
      body: "Escreva a mensagem.",
    });
  });

  it("limites de 100 e 500 caracteres", () => {
    expect(
      campaignErrors({ title: "a".repeat(101), body: "a".repeat(501) }),
    ).toEqual({
      title: "Use até 100 caracteres.",
      body: "Use até 500 caracteres.",
    });
  });

  it("só {nome} e {estabelecimento}, também no título", () => {
    expect(
      campaignErrors({ title: "Oi {nome}", body: "No {estabelecimento}" }),
    ).toEqual({});
    expect(campaignErrors({ title: "Oi {data}", body: "{servico}" })).toEqual({
      title: "{data} não existe nesta mensagem.",
      body: "{servico} não existe nesta mensagem.",
    });
  });
});

describe("clientsLabel", () => {
  it("singular e plural", () => {
    expect(clientsLabel(1)).toBe("1 cliente");
    expect(clientsLabel(0)).toBe("0 clientes");
    expect(clientsLabel(12)).toBe("12 clientes");
  });
});
