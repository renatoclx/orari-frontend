// Manual da plataforma (manual-super-admin.html, imagens s01 a s16), no banco
// local. Usa o Playwright (Chrome instalado) e a API local (3333) com o token do
// SUPER_ADMIN em SA_TOKEN (README, passo 11).
//
// GRAVA assinaturas e pagamentos fictícios em empresas de teste (Aurora, Orari
// Demo, John Doe, Renatone e Bela Vista) e uma assinatura na Clínica Nova
// Teste; a Clínica Bem-Estar só aparece nas listas. Depois das capturas,
// apague tudo (README, passo 11).
import { chromium } from "../../../node_modules/playwright/index.mjs";
import { AURORA } from "./demo-config.mjs";

const APP = "http://localhost:3000";
const API = "http://localhost:3333";
const OUT = new URL("../images/", import.meta.url).pathname;
const TOKEN = process.env.SA_TOKEN;
if (!TOKEN) throw new Error("Defina SA_TOKEN (token do SUPER_ADMIN local).");

const IDS = {
  aurora: "c0f40b30-52e2-4f05-b66b-65daae5eca3e",
  demo: "0a7b561c-badb-4ebe-928d-d2ad374cd23e",
  johnDoe: "7109ff5f-7b46-4865-bfa7-e64dc6deb700",
  renatone: "1b99a899-cf3c-42e6-86fb-10df0fa80876",
  belaVista: "189fd5a6-3629-4430-9a6b-43fff00b7a39",
  novaTeste: "a018f007-23df-4862-a8bc-1bf6f5e2665a",
};

async function api(method, path, body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
    },
    body: body && JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path}: ${response.status} ${await response.text()}`);
  }
}
const subscription = (id, data) =>
  api("PUT", `/companies/${id}/subscription`, {
    extraProfessionals: 0,
    anamnesisAddon: false,
    ...data,
  });
const payment = (id, data) =>
  api("POST", `/companies/${id}/subscription/payments`, { method: "PIX", ...data });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});

async function context(withToken, size = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport: size, colorScheme: "light" });
  if (withToken) {
    await ctx.addCookies([
      { name: "orari_access", value: TOKEN, domain: "localhost", path: "/" },
    ]);
  }
  return ctx;
}
async function open(page, path, wait = 1500) {
  await page.goto(`${APP}${path}`, { waitUntil: "networkidle" });
  await sleep(wait);
}
const shot = (page, name, clip) =>
  page.screenshot({ path: `${OUT}${name}.png`, ...(clip && { clip }) });
const shotDialog = (page, name) =>
  page.locator('[role="dialog"], [role="alertdialog"]').last().screenshot({ path: `${OUT}${name}.png` });

// ---- O que a empresa vê: a faixa do teste e o somente leitura (Marina, Aurora).
await subscription(IDS.aurora, {
  plan: "CLINICAL", cycle: "MONTHLY", price: 146.8, trialEndsAt: "2026-11-20",
});
const company = await context(false);
const marina = await company.newPage();
await open(marina, "/login", 500);
await marina.locator('input[type="email"]').fill(AURORA.email);
await marina.locator('input[type="password"]').fill(AURORA.password);
await marina.locator('button[type="submit"]').click();
await marina.waitForURL((url) => !url.pathname.startsWith("/login"));
await open(marina, "/clientes", 2500);
await shot(marina, "s14-faixa-teste", { x: 0, y: 0, width: 1440, height: 330 });
await subscription(IDS.aurora, {
  plan: "CLINICAL", cycle: "MONTHLY", price: 146.8, trialEndsAt: "2026-11-10",
});
await open(marina, "/clientes", 2500);
await shot(marina, "s15-somente-leitura", { x: 0, y: 0, width: 1440, height: 520 });
await company.close();

// ---- Dados fictícios das assinaturas (hoje: 17/11/2026).
await subscription(IDS.aurora, {
  plan: "CLINICAL", cycle: "MONTHLY", price: 146.8, extraProfessionals: 1,
  trialEndsAt: "2026-11-01", discountPercent: 50, discountUntil: "2027-02-01",
});
await payment(IDS.aurora, {
  amount: 73.4, paidAt: "2026-11-02", periodStart: "2026-11-02", periodEnd: "2026-12-01",
  note: "Oferta de lançamento",
});
await subscription(IDS.demo, {
  plan: "PLUS", cycle: "ANNUAL", price: 754.8, trialEndsAt: "2026-10-04",
});
await payment(IDS.demo, {
  amount: 754.8, paidAt: "2026-10-05", method: "CARD",
  periodStart: "2026-10-05", periodEnd: "2027-10-04",
});
await subscription(IDS.johnDoe, {
  plan: "ESSENTIAL", cycle: "MONTHLY", price: 69.8, anamnesisAddon: true,
  trialEndsAt: "2026-10-13", discountPercent: 50, discountUntil: "2027-01-13",
});
await payment(IDS.johnDoe, {
  amount: 34.9, paidAt: "2026-10-14", periodStart: "2026-10-14", periodEnd: "2026-11-13",
});
await subscription(IDS.renatone, {
  plan: "ESSENTIAL", cycle: "MONTHLY", price: 44.9, trialEndsAt: "2026-11-20",
});
await subscription(IDS.belaVista, {
  plan: "PLUS", cycle: "MONTHLY", price: 89.9, trialEndsAt: "2026-09-09",
});
await payment(IDS.belaVista, {
  amount: 89.9, paidAt: "2026-09-10", periodStart: "2026-09-10", periodEnd: "2026-10-09",
});

// ---- Telas do SUPER_ADMIN.
const admin = await context(true);
const page = await admin.newPage();

await open(page, "/painel", 2500);
await shot(page, "s01-painel");
const scrollTo = async (selector) => {
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: "start" }), selector);
  await sleep(800);
};
await scrollTo('[aria-label="Receita e empresas"]');
await shot(page, "s02-painel-receita");
await scrollTo('[aria-label="Crescimento"]');
await shot(page, "s03-painel-crescimento");
await scrollTo('[aria-label="Uso"]');
await shot(page, "s04-painel-uso");

await open(page, "/empresas", 2000);
await shot(page, "s05-empresas");
await page.getByRole("button", { name: "Acessos e limites de Studio Aurora" }).click();
await page.getByText("Funcionalidades").waitFor();
await sleep(800);
await shotDialog(page, "s06-acessos");
await page.keyboard.press("Escape");
await sleep(500);

await open(page, "/assinaturas", 2000);
await shot(page, "s07-assinaturas");
await open(page, `/assinaturas/${IDS.aurora}`, 2000);
await shot(page, "s08-assinatura");

// Nova assinatura (Clínica Nova Teste): salva e mostra a pergunta dos acessos;
// "Agora não" para não mexer nos acessos dela.
await open(page, `/assinaturas/${IDS.novaTeste}`, 2000);
await shot(page, "s09-nova-assinatura");
await page.getByRole("button", { name: "Cadastrar" }).click();
await page.getByRole("alertdialog").waitFor();
await sleep(600);
await shotDialog(page, "s10-aplicar-acessos");
await page.getByRole("button", { name: "Agora não" }).click();
await page.waitForURL("**/assinaturas");
await sleep(1500);

await page.getByRole("button", { name: "Pagamentos de Studio Aurora" }).click();
await page.getByText("Cobre de").first().waitFor();
await sleep(600);
await shotDialog(page, "s11-pagamentos");
await page.getByRole("dialog").getByRole("button", { name: "Registrar pagamento" }).click();
await page.locator("#payment-amount").waitFor();
await sleep(600);
await shotDialog(page, "s12-registrar-pagamento");
await page.keyboard.press("Escape");

await open(page, "/cobrancas", 2000);
await shot(page, "s13-cobrancas");
await admin.close();

// ---- Cadastro sozinho e termos (sem sessão).
const visitor = await context(false, { width: 1440, height: 1000 });
const signup = await visitor.newPage();
await open(signup, "/cadastro?plano=plus", 1500);
await shot(signup, "s16-cadastro");
await visitor.close();

await browser.close();
console.log("capturas s01 a s16 gravadas em images/");
