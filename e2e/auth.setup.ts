import { expect, test as setup } from "@playwright/test";

// Entra uma vez e guarda a sessão em `.auth/user.json` (fora do git), que os
// outros testes reaproveitam: o login do backend tem limite de tentativas.
setup("entrar", async ({ page }) => {
  await page.goto("/login");
  await page.locator("input[name=email]").fill(process.env.E2E_EMAIL!);
  await page.locator("input[name=password]").fill(process.env.E2E_PASSWORD!);
  await page.locator("form button[type=submit]").click();
  await expect(page).not.toHaveURL(/\/login/);
  await page.context().storageState({ path: ".auth/user.json" });
});
