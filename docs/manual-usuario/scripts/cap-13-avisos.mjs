// Capturas dos avisos e do sino (manuais do administrador, de Mensagens, do app
// do cliente e do app do profissional), no "Studio Aurora" e na "Clínica Nova
// Teste". Usa o Playwright e o banco local (DATABASE_URL): insere avisos de
// exemplo para a Marina, a Camila e a conta do cliente de teste, e APAGA todos
// antes de terminar. Só abre telas; não grava agendamento nem mensagem.
//
// Uso: DATABASE_URL=... CLIENT_PHONE=... CLIENT_PASSWORD=... node scripts/cap-13-avisos.mjs
// Saídas em images/: n01-sino, n02-primeiros-passos, m01-automaticas (Ao cliente),
// m04-ao-profissional, m05-ao-administrador, a06-local-cliente, a07-agendar,
// a14-aviso-na-tela, pro-13-avisos, pro-14-aviso-na-tela, pro-15-avisos-no-celular.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AURORA } from "./demo-config.mjs";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { chromium } = await import(join(root, "node_modules/playwright/index.mjs"));
const pg = require(join(root, "..", "backend/node_modules/pg"));

const APP = process.env.APP_URL ?? "http://localhost:3000";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "images");
const PRO = { email: "camila.rocha@studioaurora.demo", password: process.env.PRO_PASSWORD ?? "Camila#App2026" };
const NOVA = { email: "carlos.teste@clinicanova.demo", password: process.env.NOVA_PASSWORD ?? "Clinica#Nova2026" };
const CLIENT = { phone: process.env.CLIENT_PHONE, password: process.env.CLIENT_PASSWORD };

async function sql(query, params = []) {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try { return (await c.query(query, params)).rows; } finally { await c.end(); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
// O indicador do Next em desenvolvimento ("N") não entra nas imagens.
async function newCtx(options) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal{display:none!important}";
      document.head.appendChild(style);
    });
  });
  return context;
}
const KEY = "manual-cap-13";
const made = { notifications: [], messages: [], hidden: [] };

// Esconde (clearedAt) os avisos que já existem para a captura mostrar só os de
// exemplo, sem nomes reais; ao final, o mesmo conjunto volta como estava.
async function hideExisting(email) {
  const rows = await sql(
    `update user_notifications set "clearedAt"=now() where "userId"=(select id from users where email=$1) and "clearedAt" is null returning id`,
    [email],
  );
  made.hidden.push(...rows.map((r) => r.id));
}

async function notify(email, category, title, body, url) {
  const [u] = await sql(`select id,"companyId" from users where email=$1`, [email]);
  const [n] = await sql(
    `insert into user_notifications (id,"companyId","userId",category,title,body,url,"dedupeKey") values (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7) returning id`,
    [u.companyId, u.id, category, title, body, url, `${KEY}-${Math.random()}`],
  );
  made.notifications.push(n.id);
}

try {
  // ===== Painel: o sino (Marina, Studio Aurora) =====
  await hideExisting(AURORA.email);
  await notify(AURORA.email, "APPOINTMENT", "Cliente cancelou pelo app", "Ana cancelou Pilates com Camila em 16/11 às 09:00.", "/");
  await notify(AURORA.email, "PENDING_SUMMARY", "Resumo das pendências de hoje", "Bom dia, Marina! Hoje: 2 contas a pagar, 3 recebimentos atrasados e 1 aniversariante.", "/dashboard");
  const panel = await (await newCtx({ viewport: { width: 1280, height: 800 } })).newPage();
  await panel.goto(`${APP}/login`, { waitUntil: "networkidle" });
  await panel.locator('input[type="email"]').fill(AURORA.email);
  await panel.locator('input[type="password"]').fill(AURORA.password);
  await panel.locator('button[type="submit"]').click();
  await panel.waitForURL((u) => u.pathname === "/", { timeout: 20000 }).catch(() => {});
  await panel.waitForLoadState("networkidle");
  await sleep(1500);
  await panel.getByRole("button", { name: /Notificações/ }).click();
  await sleep(1200);
  await panel.screenshot({ path: `${OUT}/n01-sino.png`, clip: { x: 620, y: 0, width: 660, height: 480 } });
  await panel.keyboard.press("Escape");
  for (const [path, name] of [["/mensagens/clientes", "m01-automaticas"], ["/mensagens/profissionais", "m04-ao-profissional"], ["/mensagens/administradores", "m05-ao-administrador"]]) {
    await panel.goto(`${APP}${path}`, { waitUntil: "networkidle" });
    await sleep(800);
    await panel.locator("main").screenshot({ path: `${OUT}/${name}.png` });
  }
  await panel.context().close();

  // ===== Painel: Primeiros passos (Clínica Nova Teste, vazia) =====
  const [carlos] = await sql(`select id from users where email=$1`, [NOVA.email]);
  const before = (await sql(`select "welcomedAt","onboardingDismissedAt" from users where id=$1`, [carlos.id]))[0];
  await sql(`update users set "onboardingDismissedAt"=null where id=$1`, [carlos.id]);
  const nova = await (await newCtx({ viewport: { width: 1280, height: 1000 } })).newPage();
  await nova.goto(`${APP}/login`, { waitUntil: "networkidle" });
  await nova.locator('input[type="email"]').fill(NOVA.email);
  await nova.locator('input[type="password"]').fill(NOVA.password);
  await nova.locator('button[type="submit"]').click();
  await nova.waitForURL((u) => u.pathname === "/", { timeout: 20000 }).catch(() => {});
  await nova.goto(`${APP}/dashboard?passos=1`, { waitUntil: "networkidle" });
  await sleep(1800);
  await nova.getByRole("dialog").screenshot({ path: `${OUT}/n02-primeiros-passos.png` });
  await nova.context().close();
  await sql(`update users set "welcomedAt"=$2,"onboardingDismissedAt"=$3 where id=$1`, [carlos.id, before.welcomedAt, before.onboardingDismissedAt]);
  await sql(`delete from user_notifications where "userId"=$1 and "dedupeKey"='welcome'`, [carlos.id]);

  // ===== App do profissional (Camila) =====
  await hideExisting(PRO.email);
  await notify(PRO.email, "APPOINTMENT", "Horário marcado", "Horário marcado para 16/11 às 09:00: Pilates com Ana.", "/app/agenda");
  await notify(PRO.email, "REMINDER", "Lembrete do atendimento", "Daqui a 30 minutos: Pilates às 09:00.", "/app/agenda");
  await notify(PRO.email, "DAILY_SUMMARY", "Seu dia", "Bom dia, Camila! Hoje você tem 5 atendimentos, o primeiro às 08:00.", "/app/agenda");
  const phone = { viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 };
  const pro = await (await newCtx(phone)).newPage();
  await pro.goto(`${APP}/app/entrar`, { waitUntil: "networkidle" });
  await pro.getByLabel("Telefone ou e-mail").fill(PRO.email);
  await pro.locator('input[type="password"]').first().fill(PRO.password);
  await pro.getByRole("button", { name: "Entrar" }).click();
  await pro.waitForURL((u) => u.pathname === "/app", { timeout: 20000 });
  await pro.goto(`${APP}/app/avisos`, { waitUntil: "networkidle" });
  await sleep(1000);
  await pro.screenshot({ path: `${OUT}/pro-13-avisos.png` });
  await pro.goto(`${APP}/app/menu/notificacoes`, { waitUntil: "networkidle" });
  await sleep(1500);
  await pro.screenshot({ path: `${OUT}/pro-15-avisos-no-celular.png` });
  await pro.goto(`${APP}/app/agenda`, { waitUntil: "networkidle" });
  await sleep(3500);
  await notify(PRO.email, "APPOINTMENT", "Horário remarcado", "Horário remarcado: Pilates com Ana passou para 16/11 às 10:00.", "/app/agenda");
  await pro.locator("[data-sonner-toast]").first().waitFor({ timeout: 30000 });
  await sleep(600);
  await pro.screenshot({ path: `${OUT}/pro-14-aviso-na-tela.png` });
  await pro.context().close();

  // ===== App do cliente (conta de teste informada) =====
  if (CLIENT.phone && CLIENT.password) {
    const cli = await (await newCtx(phone)).newPage();
    await cli.goto(`${APP}/app/entrar`, { waitUntil: "networkidle" });
    await cli.getByLabel("Telefone ou e-mail").fill(CLIENT.phone);
    await cli.locator('input[type="password"]').first().fill(CLIENT.password);
    await cli.getByRole("button", { name: "Entrar" }).click();
    await cli.waitForURL((u) => u.pathname === "/app", { timeout: 20000 });
    await cli.goto(`${APP}/app/local/studio-aurora-demo`, { waitUntil: "networkidle" });
    await sleep(800);
    await cli.screenshot({ path: `${OUT}/a06-local-cliente.png` });
    await cli.locator("main ul a").first().click();
    await cli.waitForURL((u) => u.pathname.endsWith("/agendar"), { timeout: 15000 });
    await cli.waitForLoadState("networkidle");
    await sleep(1500);
    // Vários profissionais: escolhe o primeiro para os dias e horários aparecerem.
    await cli.locator("#booking-professional button").first().click();
    await sleep(3000);
    await cli.locator("button[aria-pressed]").filter({ hasText: /^\d\d:\d\d$/ }).first().click().catch(() => {});
    await sleep(500);
    await cli.screenshot({ path: `${OUT}/a07-agendar.png` });
    await cli.goto(`${APP}/app`, { waitUntil: "networkidle" });
    await sleep(3500);
    const [acc] = await sql(`select id from client_accounts where phone=$1`, [CLIENT.phone]);
    const [m] = await sql(
      `insert into client_messages (id,"clientAccountId",kind,title,body,url) values (gen_random_uuid()::text,$1,'APPOINTMENT','Horário marcado','Studio Aurora marcou Pilates para 16/11 às 09:00.','/app/agendamentos') returning id`,
      [acc.id],
    );
    made.messages.push(m.id);
    await cli.locator("[data-sonner-toast]").first().waitFor({ timeout: 30000 });
    await sleep(600);
    // Só a parte de baixo: o topo do Início traz o nome de quem entrou.
    await cli.screenshot({ path: `${OUT}/a14-aviso-na-tela.png`, clip: { x: 0, y: 500, width: 390, height: 300 } });
    await cli.context().close();
  }
} finally {
  if (made.notifications.length) await sql(`delete from user_notifications where id = any($1)`, [made.notifications]);
  if (made.hidden.length) await sql(`update user_notifications set "clearedAt"=null where id = any($1)`, [made.hidden]);
  if (made.messages.length) await sql(`delete from client_messages where id = any($1)`, [made.messages]);
  await browser.close();
}
console.log("capturas prontas");
