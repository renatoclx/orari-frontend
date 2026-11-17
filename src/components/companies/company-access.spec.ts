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
    const full = template("clinical").matrix;
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
      template("clinical").matrix,
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
  const NONE = { view: false, edit: false, create: false, remove: false };
  const ALL = { view: true, edit: true, create: true, remove: true };
  const keys = ACCESS_TEMPLATES.map((item) => item.key);

  it("são três: Essencial, Plus e Clinical", () => {
    expect(ACCESS_TEMPLATES.map((item) => item.label)).toEqual([
      "Essencial",
      "Plus",
      "Clinical",
    ]);
  });

  it("app do cliente e mensagens entram nos três", () => {
    for (const key of keys) {
      const { matrix } = template(key);
      expect(matrix["client-portal"].view).toBe(true);
      expect(matrix.messages.view).toBe(true);
      expect(matrix["professional-app"].view).toBe(true);
    }
  });

  it("Essencial: agenda, cadastros, receber (comanda) e o Dashboard; sem gestão financeira, pacotes, produtos, anamnese e turmas", () => {
    const { matrix } = template("essential");
    for (const key of [
      "appointments",
      "recurrences",
      "clients",
      "tabs",
      "payment-methods",
    ]) {
      expect(matrix[key]).toEqual(ALL);
    }
    for (const key of [
      "dashboard",
      "financial-report",
      "appointments-report",
    ]) {
      expect(matrix[key].view).toBe(true);
    }
    // Contas a receber só para ver: o Recebido do Dashboard depende dele.
    expect(matrix.payments).toEqual({ ...NONE, view: true });
    for (const key of [
      "payables",
      "commissions",
      "receivables",
      "rankings",
      "plans",
      "contracts",
      "products",
      "anamnesis",
      "class-groups",
    ]) {
      expect(matrix[key]).toEqual(NONE);
    }
  });

  it("Plus: tudo menos anamnese e turmas", () => {
    const { matrix } = template("plus");
    for (const key of [
      "payables",
      "commissions",
      "contracts",
      "products",
      "product-sales",
      "payments",
    ]) {
      expect(matrix[key].view).toBe(true);
    }
    expect(matrix.payments).toEqual(ALL);
    for (const key of [
      "anamnesis",
      "anamnesis-templates",
      "anamnesis-audit",
      "class-groups",
    ]) {
      expect(matrix[key]).toEqual(NONE);
    }
  });

  it("Clinical: tudo; Auditoria e Configurações só com as colunas aplicáveis", () => {
    const { matrix } = template("clinical");
    expect(matrix["class-groups"]).toEqual(ALL);
    expect(matrix.anamnesis).toEqual(ALL);
    expect(matrix["anamnesis-audit"]).toEqual({ ...NONE, view: true });
    expect(matrix.settings).toEqual({ ...NONE, view: true, edit: true });
  });

  it("aplicar o modelo define os limites: 2, 4 e 3 profissionais", () => {
    expect(applyTemplate(template("essential")).limits).toEqual({
      professionals: 2,
      admins: 1,
    });
    expect(applyTemplate(template("plus")).limits).toEqual({
      professionals: 4,
      admins: 1,
    });
    expect(applyTemplate(template("clinical")).limits).toEqual({
      professionals: 3,
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
    const matrix = template("plus").matrix;
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
