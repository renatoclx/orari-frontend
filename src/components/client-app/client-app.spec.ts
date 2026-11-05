import { describe, expect, it } from "vitest";
import {
  accessLinkMode,
  appointmentWhen,
  firstName,
  greetingDate,
  newPasswordErrors,
  phoneError,
  placeInitials,
} from "@/components/client-app/client-app";

describe("firstName", () => {
  it("fica com o primeiro nome", () => {
    expect(firstName("  Beatriz Nogueira ")).toBe("Beatriz");
    expect(firstName("Ana")).toBe("Ana");
  });
});

describe("phoneError", () => {
  it("aceita 10 ou 11 dígitos, com ou sem máscara", () => {
    expect(phoneError("(31) 99000-1111")).toBeUndefined();
    expect(phoneError("3133224455")).toBeUndefined();
  });

  it("vazio ou curto: a mensagem", () => {
    expect(phoneError("")).toBe("Informe o telefone com DDD.");
    expect(phoneError("9900")).toBe(
      "Informe o telefone com DDD (10 ou 11 dígitos).",
    );
  });
});

describe("newPasswordErrors", () => {
  it("curta, longa e confirmação diferente", () => {
    expect(newPasswordErrors("1234567", "1234567")).toEqual({
      password: "A senha precisa ter pelo menos 8 caracteres.",
    });
    expect(newPasswordErrors("a".repeat(73), "a".repeat(73))).toEqual({
      password: "A senha pode ter no máximo 72 caracteres.",
    });
    expect(newPasswordErrors("senha-forte", "outra")).toEqual({
      confirmation: "As senhas não são iguais.",
    });
  });

  it("válida: sem erros", () => {
    expect(newPasswordErrors("senha-forte", "senha-forte")).toEqual({});
  });
});

describe("datas no relógio da clínica", () => {
  it("saudação: dia da semana, dia, mês curto e ano", () => {
    // 05/11/2026 às 02:00 UTC ainda é quarta, 04/11, em São Paulo.
    expect(
      greetingDate(new Date("2026-11-05T15:00:00Z"), "America/Sao_Paulo"),
    ).toBe("Quinta, 5 nov 2026");
    expect(
      greetingDate(new Date("2026-11-05T02:00:00Z"), "America/Sao_Paulo"),
    ).toBe("Quarta, 4 nov 2026");
  });

  it("agendamento: dia da semana curto, data e hora", () => {
    expect(
      appointmentWhen("2026-11-12T11:00:00.000Z", "America/Sao_Paulo"),
    ).toBe("Qui, 12/11 às 08:00");
  });
});

describe("placeInitials", () => {
  it("duas iniciais ou uma", () => {
    expect(placeInitials("Studio Aurora")).toBe("SA");
    expect(placeInitials("Zeta")).toBe("Z");
  });
});

describe("accessLinkMode", () => {
  it("entrado: só liga; sem conta: cria; com conta: senha nova", () => {
    expect(accessLinkMode(true, true)).toBe("attach");
    expect(accessLinkMode(false, false)).toBe("create");
    expect(accessLinkMode(false, true)).toBe("reset");
  });
});
