import { describe, expect, it } from "vitest";
import { filterMenuByAccess } from "@/components/layout/menu-access";

const none = { view: false, edit: false, create: false, remove: false };
const all = { view: true, edit: true, create: true, remove: true };
const access = {
  features: [
    { feature: "appointments", ...all },
    { feature: "clients", ...all },
    { feature: "employees", ...none },
    { feature: "class-groups", ...none },
  ],
};

const menu = [
  { href: "/", label: "Agendamentos", feature: "appointments" },
  { href: "/turmas", label: "Turmas", feature: "class-groups" },
  { href: "/ajuda", label: "Ajuda" },
  {
    label: "Pessoas",
    children: [
      { href: "/clientes", label: "Clientes", feature: "clients" },
      { href: "/funcionarios", label: "Funcionários", feature: "employees" },
    ],
  },
  {
    label: "Anamnese",
    children: [
      { href: "/anamnese/fichas", label: "Fichas", feature: "anamnesis" },
    ],
  },
];

describe("filterMenuByAccess", () => {
  it("tira o item sem acesso, mantém o liberado e o que não depende de plano", () => {
    const labels = filterMenuByAccess(menu, access).map((e) => e.label);
    expect(labels).toEqual(["Agendamentos", "Ajuda", "Pessoas"]);
  });

  it("tira o subitem sem acesso e o grupo que ficou vazio", () => {
    const result = filterMenuByAccess(menu, access);
    const people = result.find((e) => e.label === "Pessoas") as {
      children: { label: string }[];
    };
    expect(people.children.map((c) => c.label)).toEqual(["Clientes"]);
    expect(result.some((e) => e.label === "Anamnese")).toBe(false);
  });

  it("sem o access (API antiga), o menu fica como está", () => {
    expect(filterMenuByAccess(menu, undefined)).toHaveLength(menu.length);
  });
});
