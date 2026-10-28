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
      if (el.closest("[data-scroll-x]")) continue; // rola de propósito (abas)
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

// Telas de detalhe: o id vem da lista de clientes (os primeiros da página).
const HISTORY_TABS = [
  "agendamentos",
  "recorrencias",
  "pacotes",
  "pagamentos",
  "anamnese",
];

test("histórico do cliente não rola na horizontal (todas as abas)", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);

  // Clientes das primeiras páginas da lista (o id vem da própria tela).
  const histories: string[] = [];
  for (const pageNumber of [1, 2, 3]) {
    await openRoute(page, `/clientes?page=${pageNumber}`);
    const hrefs = await page
      .getByRole("link", { name: /^Visualizar histórico de / })
      .evaluateAll((links) => links.map((a) => a.getAttribute("href")!));
    if (hrefs.length === 0) break;
    histories.push(...hrefs);
  }
  expect(histories.length).toBeGreaterThan(0);

  // Uma aba vazia só mostra a mensagem e não prova nada: cada aba é conferida
  // até aparecer um cliente que tenha dados nela.
  const verified = new Set<string>();
  for (const href of histories) {
    for (const tab of HISTORY_TABS) {
      if (verified.has(tab)) continue;
      await openRoute(page, `${href}?aba=${tab}`);
      expect(await horizontalOverflow(page), `${href} ${tab}`).toEqual([]);
      if (
        (await page.locator("main tbody tr, main ul.divide-y > li").count()) > 0
      ) {
        verified.add(tab);
      }
    }
    if (verified.size === HISTORY_TABS.length) break;
  }
  for (const tab of HISTORY_TABS) {
    if (!verified.has(tab)) {
      testInfo.annotations.push({
        type: "cobertura parcial",
        description: `nenhum cliente tinha dados na aba "${tab}"`,
      });
    }
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
