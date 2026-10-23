import { describe, expect, it } from "vitest";
import {
  validateBusinessHours,
  type BusinessHourDraft,
} from "@/components/settings/business-hours-validation";

const hour = (
  key: string,
  weekDay: BusinessHourDraft["weekDay"],
  openAt: string,
  closeAt: string,
): BusinessHourDraft => ({ key, weekDay, openAt, closeAt });

describe("validateBusinessHours", () => {
  it("janelas bem formadas e separadas não têm erro", () => {
    expect(
      validateBusinessHours([
        hour("a", "MONDAY", "08:00", "12:00"),
        hour("b", "MONDAY", "14:00", "18:00"),
        hour("c", "TUESDAY", "08:00", "18:00"),
      ]),
    ).toEqual({});
  });

  it("sem janelas, não há erro", () => {
    expect(validateBusinessHours([])).toEqual({});
  });

  it("abertura e fechamento são obrigatórios", () => {
    const errors = validateBusinessHours([
      hour("a", "MONDAY", "", "12:00"),
      hour("b", "MONDAY", "13:00", ""),
    ]);

    expect(errors.a).toBe("Informe a abertura e o fechamento.");
    expect(errors.b).toBe("Informe a abertura e o fechamento.");
  });

  it("a abertura precisa ser antes do fechamento", () => {
    const errors = validateBusinessHours([
      hour("igual", "MONDAY", "09:00", "09:00"),
      hour("invertida", "TUESDAY", "18:00", "08:00"),
    ]);

    expect(errors.igual).toBe("A abertura deve ser antes do fechamento.");
    expect(errors.invertida).toBe("A abertura deve ser antes do fechamento.");
  });

  it("encostar é permitido: 12:00–13:00 e 13:00–18:00", () => {
    expect(
      validateBusinessHours([
        hour("a", "MONDAY", "12:00", "13:00"),
        hour("b", "MONDAY", "13:00", "18:00"),
      ]),
    ).toEqual({});
  });

  it("janelas do mesmo dia que se sobrepõem dão erro nas duas", () => {
    const errors = validateBusinessHours([
      hour("a", "MONDAY", "08:00", "12:00"),
      hour("b", "MONDAY", "11:00", "15:00"),
    ]);

    expect(errors.a).toBe("Esta janela se sobrepõe a outra do mesmo dia.");
    expect(errors.b).toBe("Esta janela se sobrepõe a outra do mesmo dia.");
  });

  it("uma janela dentro da outra também se sobrepõe", () => {
    const errors = validateBusinessHours([
      hour("a", "MONDAY", "08:00", "18:00"),
      hour("b", "MONDAY", "10:00", "11:00"),
    ]);

    expect(Object.keys(errors).sort()).toEqual(["a", "b"]);
  });

  it("dias diferentes nunca se sobrepõem", () => {
    expect(
      validateBusinessHours([
        hour("a", "MONDAY", "08:00", "18:00"),
        hour("b", "TUESDAY", "08:00", "18:00"),
      ]),
    ).toEqual({});
  });

  it("uma janela inválida não gera erro de sobreposição nas outras", () => {
    const errors = validateBusinessHours([
      hour("ruim", "MONDAY", "18:00", "08:00"),
      hour("boa", "MONDAY", "09:00", "10:00"),
    ]);

    expect(errors).toEqual({
      ruim: "A abertura deve ser antes do fechamento.",
    });
  });
});
