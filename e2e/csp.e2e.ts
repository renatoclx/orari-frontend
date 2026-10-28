import { expect, test, type Page } from "@playwright/test";
import { DIALOGS, openRoute, ROUTES } from "./routes";

// A política de conteúdo (CSP) está em `next.config.ts`. Em desenvolvimento ela
// é só "Report-Only": esta suíte garante que nenhuma tela nem diálogo a viola,
// que é o que impediria ligá-la de verdade em produção sem quebrar nada.
test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "computador", "independe do tamanho");
  await page.addInitScript(() => {
    const store = window as unknown as { __csp: string[] };
    store.__csp = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      store.__csp.push(`${event.violatedDirective}: ${event.blockedURI}`);
    });
  });
});

const violations = (page: Page) =>
  page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);

for (const route of ROUTES) {
  test(`${route} sem violação da CSP`, async ({ page }) => {
    await openRoute(page, route);
    expect(await violations(page)).toEqual([]);
  });
}

for (const { route, button } of DIALOGS) {
  test(`"${button}" sem violação da CSP`, async ({ page }) => {
    await openRoute(page, route);
    await page.getByRole("button", { name: button }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
}
