import { describe, expect, it } from "vitest";
import {
  ACCESS_GROUPS,
  ACCESS_TEMPLATES,
  applyTemplate,
  emptyMatrix,
  entriesFromMatrix,
  matrixFromEntries,
  isActionApplicable,
  limitWarning,
  parseLimit,
  toggleAccess,
  validateLimits,
} from "@/components/companies/company-access";

const featureKeys = ACCESS_GROUPS.flatMap((g) => g.features.map((f) => f.key));
const template = (key: string) => ACCESS_TEMPLATES.find((t) => t.key === key)!;

describe("emptyMatrix", () => {
  it("nasce tudo desmarcado, uma linha por funcionalidade", () => {
    const matrix = emptyMatrix();
    expect(Object.keys(matrix)).toEqual(featureKeys);
    expect(
      Object.values(matrix).every((row) => !Object.values(row).some(Boolean)),
    ).toBe(true);
  });
});

describe("toggleAccess", () => {
  it("marcar Edita garante o Visualiza", () => {
    const next = toggleAccess(emptyMatrix(), "clients", "edit", true);
    expect(next.clients).toEqual({
      view: true,
      edit: true,
      create: false,
      remove: false,
    });
  });

  it("desmarcar Visualiza limpa a linha toda", () => {
    const full = template("complete").matrix;
    const next = toggleAccess(full, "clients", "view", false);
    expect(next.clients).toEqual({
      view: false,
      edit: false,
      create: false,
      remove: false,
    });
    expect(next.services.view).toBe(true);
  });

  it("desmarcar outra coluna mantém o Visualiza", () => {
    const next = toggleAccess(
      template("complete").matrix,
      "clients",
      "create",
      false,
    );
    expect(next.clients).toEqual({
      view: true,
      edit: true,
      create: false,
      remove: true,
    });
  });

  it("ignora coluna que não se aplica à funcionalidade", () => {
    const matrix = emptyMatrix();
    expect(isActionApplicable("anamnesis-audit", "edit")).toBe(false);
    expect(toggleAccess(matrix, "anamnesis-audit", "edit", true)).toBe(matrix);
  });
});

describe("modelos de plano", () => {
  it("Essencial deixa de fora anamnese e turmas", () => {
    const { matrix } = template("essential");
    expect(matrix.anamnesis.view).toBe(false);
    expect(matrix["class-groups"].view).toBe(false);
    expect(matrix.appointments).toEqual({
      view: true,
      edit: true,
      create: true,
      remove: true,
    });
  });

  it("Profissional libera anamnese, mas não turmas", () => {
    const { matrix } = template("professional");
    expect(matrix.anamnesis.view).toBe(true);
    expect(matrix["class-groups"].view).toBe(false);
  });

  it("Completo libera tudo o que existe (menos Portal e Mensagens); Auditoria e Configurações só têm as colunas aplicáveis", () => {
    const { matrix } = template("complete");
    expect(matrix["anamnesis-audit"]).toEqual({
      view: true,
      edit: false,
      create: false,
      remove: false,
    });
    expect(matrix.settings).toEqual({
      view: true,
      edit: true,
      create: false,
      remove: false,
    });
  });

  it("nenhum modelo inclui Portal do cliente e Mensagens (liberados empresa por empresa)", () => {
    for (const key of ["essential", "professional", "complete"]) {
      const { matrix } = template(key);
      expect(matrix["client-portal"].view).toBe(false);
      expect(matrix.messages).toEqual({
        view: false,
        edit: false,
        create: false,
        remove: false,
      });
    }
  });

  it("todos os modelos incluem os relatórios (Visualiza)", () => {
    for (const key of ["essential", "professional", "complete"]) {
      expect(template(key).matrix["client-portfolio"].view).toBe(true);
      expect(template(key).matrix["receivables"].view).toBe(true);
    }
  });

  it("aplicar o Essencial define 3 profissionais e 1 administrador; os outros mantêm os profissionais", () => {
    const current = {
      matrix: emptyMatrix(),
      limits: { professionals: 5, admins: 1 },
    };
    expect(applyTemplate(template("essential"), current).limits).toEqual({
      professionals: 3,
      admins: 1,
    });
    expect(applyTemplate(template("complete"), current).limits).toEqual({
      professionals: 5,
      admins: 2,
    });
  });
});

describe("limites", () => {
  it("aceita inteiros de 1 a 999", () => {
    expect(parseLimit("3")).toBe(3);
    expect(parseLimit(" 999 ")).toBe(999);
    for (const bad of ["", "0", "1000", "2,5", "-1", "abc"]) {
      expect(parseLimit(bad)).toBeUndefined();
    }
  });

  it("validateLimits aponta cada campo inválido", () => {
    expect(validateLimits({ professionals: "3", admins: "1" })).toEqual({});
    expect(
      Object.keys(validateLimits({ professionals: "", admins: "0" })),
    ).toEqual(["professionals", "admins"]);
  });

  it("avisa quando o limite fica abaixo do uso, sem bloquear", () => {
    expect(limitWarning("1", 2)).toMatch(/continua funcionando/);
    expect(limitWarning("2", 2)).toBeUndefined();
    expect(limitWarning("", 2)).toBeUndefined();
  });
});

describe("conversão com a API", () => {
  it("ida e volta mantém a matriz", () => {
    const matrix = template("professional").matrix;
    expect(matrixFromEntries(entriesFromMatrix(matrix))).toEqual(matrix);
  });

  it("funcionalidade que falta na resposta fica sem acesso; a desconhecida é ignorada", () => {
    const matrix = matrixFromEntries([
      {
        feature: "clients",
        view: true,
        edit: false,
        create: false,
        remove: false,
      },
      {
        feature: "foguete",
        view: true,
        edit: true,
        create: true,
        remove: true,
      },
    ]);
    expect(matrix.clients.view).toBe(true);
    expect(matrix["class-groups"].view).toBe(false);
    expect("foguete" in matrix).toBe(false);
  });

  it("a lista enviada traz todas as funcionalidades da matriz", () => {
    expect(entriesFromMatrix(emptyMatrix())).toHaveLength(featureKeys.length);
  });
});
