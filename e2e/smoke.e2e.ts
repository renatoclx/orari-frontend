import { expect, test, type Page } from "@playwright/test";
import { DIALOGS, openRoute, ROUTES } from "./routes";

// O que passa da largura da tela: a própria página, ou um contêiner com rolagem
// lateral visível (tabela larga, por exemplo). Lista vazia = nada estoura.
function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const found: string[] = [];
    const root = document.documentElement;
    if (root.scrollWidth > window.innerWidth) {
      found.push(`página: ${root.scrollWidth}px em ${window.innerWidth}px`);
    }
    for (const el of document.querySelectorAll<HTMLElement>(
      "main *, [role=dialog] *",
    )) {
      if (!el.offsetParent) continue; // oculto
      const overflowX = getComputedStyle(el).overflowX;
      if (overflowX === "visible" || overflowX === "hidden") continue;
      if (el.scrollWidth > el.clientWidth + 1) {
        found.push(
          `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)}`,
        );
      }
    }
    return found;
  });
}

test.describe("telas", () => {
  for (const route of ROUTES) {
    test(`${route} não rola na horizontal`, async ({ page }) => {
      await openRoute(page, route);
      expect(await horizontalOverflow(page)).toEqual([]);
    });
  }
});

test.describe("diálogos", () => {
  for (const { route, button } of DIALOGS) {
    test(`"${button}" cabe na tela e abre sem dica`, async ({ page }) => {
      await openRoute(page, route);
      await page.getByRole("button", { name: button }).first().click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await page.waitForTimeout(500); // o tempo de uma dica abrir, se fosse abrir

      // Dentro da área visível (nada de título ou botões cortados)...
      const box = await dialog.boundingBox();
      const viewport = page.viewportSize()!;
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      // ...sem rolagem lateral...
      expect(await horizontalOverflow(page)).toEqual([]);
      // ...e sem nenhuma dica visível (o foco automático não abre dica).
      await expect(page.locator("[data-slot=tooltip-content]")).toHaveCount(0);
    });
  }
});

test("menu do celular abre sem dica", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "celular", "só existe no celular");
  await openRoute(page, "/");
  await page.getByRole("button", { name: "Abrir menu" }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.locator("[data-slot=tooltip-content]")).toHaveCount(0);
});
