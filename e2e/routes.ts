import { expect, type Page } from "@playwright/test";

// Telas sem parâmetro na URL (as de detalhe dependem do que há nos dados).
export const ROUTES = [
  "/",
  "/recorrencias",
  "/recorrencias/nova",
  "/clientes",
  "/clientes/novo",
  "/funcionarios",
  "/profissionais",
  "/usuarios",
  "/servicos",
  "/turmas",
  "/turmas/nova",
  "/pacotes/planos",
  "/pacotes/planos/novo",
  "/pacotes/contratacoes",
  "/pacotes/contratacoes/nova",
  "/financeiro",
  "/financeiro/comandas",
  "/financeiro/metodos-de-pagamento",
  "/anamnese/fichas",
  "/anamnese/fichas/nova",
  "/anamnese/modelos",
  "/anamnese/modelos/novo",
  "/anamnese/auditoria",
  "/configuracoes",
  "/ajuda",
];

// Botões que abrem um diálogo, por tela.
export const DIALOGS = [
  { route: "/", button: "Novo Agendamento" },
  { route: "/", button: "Encaixar horário" },
  { route: "/servicos", button: "Novo serviço" },
  { route: "/usuarios", button: "Novo usuário" },
  {
    route: "/financeiro/metodos-de-pagamento",
    button: "Novo método de pagamento",
  },
];

export async function openRoute(page: Page, route: string) {
  await page.goto(route);
  await expect(page.locator("h1").first()).toBeVisible();
}
