import { describe, expect, it } from "vitest";
import { pdfErrorMessage } from "@/components/anamnesis/records/pdf-error";

describe("pdfErrorMessage", () => {
  it("tem texto próprio para sessão, acesso e ficha inexistente", () => {
    expect(pdfErrorMessage(401)).toMatch(/sessão expirou/);
    expect(pdfErrorMessage(403)).toMatch(/não tem acesso/);
    expect(pdfErrorMessage(404)).toMatch(/não encontrada/);
  });

  it("nos demais usa o texto da API, ou um genérico", () => {
    expect(pdfErrorMessage(502, "Não foi possível conectar ao servidor.")).toBe(
      "Não foi possível conectar ao servidor.",
    );
    expect(pdfErrorMessage(500)).toMatch(/Tente novamente/);
  });
});
