import { describe, expect, it } from "vitest";
import type { AutoMessage } from "@/types/auto-message";
import {
  autoMessageErrors,
  autoMessagesHaveErrors,
  insertVariable,
  previewMessage,
  toggleOffset,
  unknownVariables,
} from "./auto-messages";

const message = (over: Partial<AutoMessage> = {}): AutoMessage => ({
  kind: "REMINDER",
  enabled: true,
  body: "Olá, {nome}!",
  reminderOffsets: [1440, 30],
  missYouDays: null,
  ...over,
});

describe("situações do profissional", () => {
  it("o resumo aceita {quantidade}; o lembrete não; nenhuma aceita o nome do cliente", () => {
    expect(
      unknownVariables("{nome} {quantidade} {hora}", "PROFESSIONAL_SUMMARY"),
    ).toEqual([]);
    expect(unknownVariables("{quantidade}", "PROFESSIONAL_REMINDER")).toEqual([
      "quantidade",
    ]);
    expect(unknownVariables("{cliente}", "PROFESSIONAL_REMINDER")).toEqual([
      "cliente",
    ]);
  });

  it("o lembrete do profissional ligado não pede tempo (é fixo em 30 min)", () => {
    const errors = autoMessageErrors(
      message({
        kind: "PROFESSIONAL_REMINDER",
        body: "Atendimento às {hora}.",
        reminderOffsets: [],
      }),
    );
    expect(errors).toEqual({});
  });

  it("o exemplo do resumo mostra a quantidade", () => {
    expect(previewMessage("Hoje: {quantidade}", "Studio")).toBe(
      "Hoje: 5 atendimentos",
    );
  });
});

describe("unknownVariables", () => {
  it("aniversário não tem data nem serviço; o lembrete tem", () => {
    expect(unknownVariables("{nome} {data} {servico}", "BIRTHDAY")).toEqual([
      "data",
      "servico",
    ]);
    expect(unknownVariables("{nome} {data} {servico}", "REMINDER")).toEqual([]);
  });
});

describe("autoMessageErrors", () => {
  it("texto vazio, longo demais ou com variável inventada", () => {
    expect(autoMessageErrors(message({ body: "  " })).body).toBe(
      "Escreva a mensagem.",
    );
    expect(autoMessageErrors(message({ body: "a".repeat(501) })).body).toBe(
      "Use até 500 caracteres.",
    );
    expect(
      autoMessageErrors(
        message({ kind: "MISS_YOU", body: "Oi {nome} {hora} {cpf}" }),
      ).body,
    ).toBe("{hora}, {cpf} não existe nesta mensagem.");
  });

  it("lembrete ligado sem tempo; desligado, pode", () => {
    expect(
      autoMessageErrors(message({ reminderOffsets: [] })).offsets,
    ).toBeDefined();
    expect(
      autoMessageErrors(message({ enabled: false, reminderOffsets: [] }))
        .offsets,
    ).toBeUndefined();
  });

  it("autoMessagesHaveErrors olha todas", () => {
    expect(
      autoMessagesHaveErrors([
        message(),
        message({ kind: "BIRTHDAY", body: "" }),
      ]),
    ).toBe(true);
    expect(autoMessagesHaveErrors([message()])).toBe(false);
  });
});

describe("previewMessage", () => {
  it("troca pelas amostras e pelo nome da clínica; o resto fica", () => {
    expect(
      previewMessage(
        "{nome}, {servico} com {profissional} em {data} às {hora} no {estabelecimento} {x}",
        "Studio Aurora",
      ),
    ).toBe("Ana, Pilates com Camila em 12/11 às 09:00 no Studio Aurora {x}");
  });
});

describe("insertVariable", () => {
  it("no cursor, ou no lugar da seleção", () => {
    expect(insertVariable("Olá, !", "nome", { start: 5, end: 5 })).toEqual({
      body: "Olá, {nome}!",
      caret: 11,
    });
    expect(
      insertVariable("Olá, fulano!", "nome", { start: 5, end: 11 }),
    ).toEqual({ body: "Olá, {nome}!", caret: 11 });
  });
});

describe("toggleOffset", () => {
  it("liga e desliga, do maior para o menor", () => {
    expect(toggleOffset([30], 1440)).toEqual([1440, 30]);
    expect(toggleOffset([1440, 30], 1440)).toEqual([30]);
  });
});
