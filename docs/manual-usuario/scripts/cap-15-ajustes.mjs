// Capturas dos ajustes de 24/11/2026 (manuais do administrador, do app do
// cliente e do app do profissional): a tela de entrar com "Esqueci minha
// senha", o menu do usuário com "Alterar senha", o Agendar com os profissionais
// em círculos e a confirmação, e a Agenda do profissional com a faixa de dias.
// Usa o Playwright. SÓ ABRE TELAS: não grava nada e não confirma o agendamento.
//
// Uso: CLIENT_PHONE=... CLIENT_PASSWORD=... PRO_PASSWORD=... AURORA_PASSWORD=... node scripts/cap-15-ajustes.mjs
// (a conta do cliente precisa ser cliente do Studio Aurora; o Agendar não mostra
// o nome de quem entrou). Saídas em images/: 01-login, 03-menu-usuario,
// a07-agendar, a07b-confirmar, pro-04-agenda.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AURORA } from "./demo-config.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { chromium } = await import(join(root, "node_modules/playwright/index.mjs"));

const APP = process.env.APP_URL ?? "http://localhost:3000";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "images");
const PRO = { email: "camila.rocha@studioaurora.demo", password: process.env.PRO_PASSWORD ?? "Camila#App2026" };
const CLIENT = { phone: process.env.CLIENT_PHONE, password: process.env.CLIENT_PASSWORD };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
// O indicador do Next em desenvolvimento ("N") não entra nas imagens.
async function newPage(options) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal{display:none!important}";
      document.head.appendChild(style);
    });
  });
  return context.newPage();
}
const phone = { viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 };

async function appLogin(page, login, password) {
  await page.goto(`${APP}/app/entrar`, { waitUntil: "networkidle" });
  await page.getByLabel("Telefone ou e-mail").fill(login);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((u) => u.pathname === "/app", { timeout: 20000 });
}

try {
  // ===== Sistema: entrar e menu do usuário (Marina, Studio Aurora) =====
  const web = await newPage({ viewport: { width: 1440, height: 900 } });
  await web.goto(`${APP}/login`, { waitUntil: "networkidle" });
  await sleep(800);
  await web.screenshot({ path: `${OUT}/01-login.png` });
  await web.locator('input[type="email"]').fill(AURORA.email);
  await web.locator('input[type="password"]').fill(AURORA.password);
  await web.getByRole("button", { name: "Entrar" }).click();
  await web.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
  await web.waitForLoadState("networkidle");
  await web.getByRole("button", { name: /Menu do usuário/ }).click();
  const menu = web.getByRole("menu");
  await menu.waitFor();
  await sleep(500);
  // Recorte do menu com uma folga em volta, como na imagem anterior.
  const box = await menu.boundingBox();
  await web.screenshot({
    path: `${OUT}/03-menu-usuario.png`,
    clip: { x: box.x - 30, y: box.y - 30, width: box.width + 60, height: box.height + 60 },
  });
  await web.context().close();

  // ===== App do profissional: a Agenda de hoje (Camila, Studio Aurora) =====
  const pro = await newPage(phone);
  await appLogin(pro, PRO.email, PRO.password);
  await pro.goto(`${APP}/app/agenda`, { waitUntil: "networkidle" });
  await sleep(1200);
  await pro.screenshot({ path: `${OUT}/pro-04-agenda.png` });
  await pro.context().close();

  // ===== App do cliente: Agendar e a confirmação (sem confirmar) =====
  if (CLIENT.phone && CLIENT.password) {
    const cli = await newPage(phone);
    await appLogin(cli, CLIENT.phone, CLIENT.password);
    await cli.goto(`${APP}/app/local/studio-aurora-demo`, { waitUntil: "networkidle" });
    await cli.locator("main ul a").first().click();
    await cli.waitForURL((u) => u.pathname.endsWith("/agendar"), { timeout: 15000 });
    await cli.waitForLoadState("networkidle");
    await sleep(1500);
    // Vários profissionais: escolhe o primeiro para os dias e horários aparecerem.
    await cli.locator("#booking-professional button").first().click();
    await cli.locator("button[aria-pressed]").filter({ hasText: /^\d\d:\d\d$/ }).first().waitFor({ timeout: 15000 });
    await cli.locator("button[aria-pressed]").filter({ hasText: /^\d\d:\d\d$/ }).first().click();
    await sleep(600);
    // Do topo: serviço, profissionais e dias à vista (o clique rolou a página).
    await cli.evaluate(() => window.scrollTo({ top: 0 }));
    await sleep(400);
    await cli.screenshot({ path: `${OUT}/a07-agendar.png` });
    await cli.getByRole("button", { name: "Revisar agendamento" }).click();
    await sleep(800);
    await cli.screenshot({ path: `${OUT}/a07b-confirmar.png` });
    await cli.context().close();
  } else {
    console.log("Sem CLIENT_PHONE/CLIENT_PASSWORD: a07-agendar e a07b-confirmar ficaram de fora.");
  }
} finally {
  await browser.close();
}
