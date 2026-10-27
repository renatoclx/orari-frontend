import { describe, expect, it } from "vitest";
import {
  auditActionLabels,
  auditActions,
  auditActorName,
  auditPeriod,
  auditQuery,
  auditTargetName,
  formatAuditDateTime,
  formatAuditIp,
  parseAuditFilters,
} from "@/components/anamnesis/audit/audit-filters";

const ID = "11111111-1111-4111-8111-111111111111";

describe("parseAuditFilters", () => {
  it("lê os filtros válidos da URL", () => {
    expect(
      parseAuditFilters({
        cliente: ID,
        usuario: ID,
        acao: "ANAMNESIS_VIEWED",
        de: "2026-10-01",
        ate: "2026-10-27",
        page: "3",
      }),
    ).toEqual({
      clientId: ID,
      userId: ID,
      action: "ANAMNESIS_VIEWED",
      from: "2026-10-01",
      to: "2026-10-27",
      page: 3,
    });
  });

  it("ignora o que for inválido", () => {
    expect(
      parseAuditFilters({
        cliente: "abc",
        usuario: ["x"],
        acao: "OUTRA",
        de: "2026-13-40",
        ate: "ontem",
        page: "-2",
      }),
    ).toEqual({
      clientId: undefined,
      userId: undefined,
      action: undefined,
      from: undefined,
      to: undefined,
      page: 1,
    });
  });
});

describe("auditPeriod", () => {
  it("vai do início do dia inicial ao fim do dia final, no fuso da empresa", () => {
    const period = auditPeriod(
      { from: "2026-10-26", to: "2026-10-27" },
      "America/Sao_Paulo",
    );
    // São Paulo é UTC-3: 26/10 00:00 = 03:00Z; 27/10 23:59:59.999 = 28/10 02:59:59.999Z.
    expect(period.from?.toISOString()).toBe("2026-10-26T03:00:00.000Z");
    expect(period.to?.toISOString()).toBe("2026-10-28T02:59:59.999Z");
  });

  it("deixa aberta a ponta sem data", () => {
    expect(auditPeriod({}, "America/Sao_Paulo")).toEqual({
      from: undefined,
      to: undefined,
    });
  });
});

describe("auditQuery", () => {
  it("só leva o que foi escolhido", () => {
    expect(
      auditQuery({ action: "ANAMNESIS_LISTED", from: "2026-10-01" }),
    ).toEqual({
      acao: "ANAMNESIS_LISTED",
      de: "2026-10-01",
    });
    expect(auditQuery({})).toEqual({});
  });
});

describe("formatação", () => {
  it("mostra data e hora no fuso informado", () => {
    expect(
      formatAuditDateTime("2026-10-27T13:29:45.540Z", "America/Sao_Paulo"),
    ).toBe("27/10/2026 10:29:45");
  });

  it("tira o prefixo IPv6 do IP", () => {
    expect(formatAuditIp("::ffff:10.0.0.1")).toBe("10.0.0.1");
    expect(formatAuditIp("2001:db8::1")).toBe("2001:db8::1");
    expect(formatAuditIp(null)).toBeNull();
  });
});

describe("rótulos das ações", () => {
  it("toda ação tem rótulo em português, inclusive as de tipo e reativação de usuário", () => {
    for (const action of auditActions) {
      expect(auditActionLabels[action]).toBeTruthy();
    }
    expect(auditActionLabels.USER_TYPE_CHANGED).toBe(
      "Tipo de usuário alterado",
    );
    expect(auditActionLabels.USER_RESTORED).toBe("Usuário reativado");
    expect(auditActions).toContain("USER_TYPE_CHANGED");
    expect(auditActions).toContain("USER_RESTORED");
  });
});

describe("nomes de quem fez e do alvo", () => {
  const names = { admin: "Helena", alvo: "Maria" };

  it("mostra o nome de quem fez, quando está na lista", () => {
    expect(
      auditActorName({ action: "USER_TYPE_CHANGED", userId: "admin" }, names),
    ).toBe("Helena");
  });

  it("quem não está na lista é administrador da plataforma nas ações sobre usuário", () => {
    for (const action of [
      "USER_LINK_CHANGED",
      "USER_TYPE_CHANGED",
      "USER_RESTORED",
    ] as const) {
      expect(auditActorName({ action, userId: "super" }, names)).toBe(
        "Administrador da plataforma",
      );
    }
  });

  it("nas demais ações, quem não está na lista é desconhecido (não vira plataforma)", () => {
    expect(
      auditActorName({ action: "ANAMNESIS_VIEWED", userId: "x" }, names),
    ).toBe("Usuário desconhecido");
  });

  it("o alvo é o usuário alterado, só nas ações sobre usuário", () => {
    expect(
      auditTargetName({ action: "USER_RESTORED", entityId: "alvo" }, names),
    ).toBe("Maria");
    expect(
      auditTargetName({ action: "USER_RESTORED", entityId: "outro" }, names),
    ).toBe("Usuário desconhecido");
    expect(
      auditTargetName({ action: "ANAMNESIS_VIEWED", entityId: "alvo" }, names),
    ).toBeNull();
  });
});
