import { describe, expect, it } from "vitest";
import { formText } from "@/lib/form-data";

describe("formText", () => {
  it("devolve o texto sem espaços nas pontas", () => {
    const data = new FormData();
    data.set("name", "  Maria  ");

    expect(formText(data, "name")).toBe("Maria");
  });

  it("campo ausente vira texto vazio", () => {
    expect(formText(new FormData(), "name")).toBe("");
  });

  it("arquivo não é texto: vira vazio", () => {
    const data = new FormData();
    data.set("photo", new File(["x"], "foto.png"));

    expect(formText(data, "photo")).toBe("");
  });
});
