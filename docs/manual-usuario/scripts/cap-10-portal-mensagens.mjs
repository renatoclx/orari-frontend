import { AURORA, AURORA_APP } from "./demo-config.mjs";
import {
  click,
  clickText,
  closeDialogs,
  ev,
  fill,
  go,
  login,
  scrollAgenda,
  send,
  shot,
  shotDialog,
  shotEl,
  sleep,
  viewport,
} from "./cdp.mjs";

// Manuais do Portal do cliente (manual-portal.html, imagens p01 a p08) e das
// Mensagens (manual-mensagens.html, m01 a m04), no "Studio Aurora". Rodar
// depois do cap-9-app.mjs: usa a cliente "Ana Demo" e o horário que ela marcou.
// Grava só um link de acesso da Ana (apagado com ela); o resto só abre telas,
// e a mensagem de Enviar não é enviada (a confirmação é fechada).
const API = process.env.API_URL ?? "http://localhost:3333";
const token = (
  await (
    await fetch(API + "/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: AURORA.email, password: AURORA.password }),
    })
  ).json()
).accessToken;
const people = (
  await (
    await fetch(
      `${API}/people?type=CLIENT&name=${encodeURIComponent(AURORA_APP.name)}&limit=5`,
      { headers: { authorization: `Bearer ${token}` } },
    )
  ).json()
).items;
const ana = people.find((p) => p.name === AURORA_APP.name);
if (!ana) throw new Error("Rode antes o cap-9-app.mjs (cliente Ana Demo).");

await viewport(1440, 900);
// Tema claro, como nas imagens dos outros manuais.
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `try { localStorage.setItem("theme", "light"); } catch {}`,
});
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-color-scheme", value: "light" }],
});
await login(AURORA.email, AURORA.password);

// ---- Portal do cliente
await go("/mensagens/automaticas", 4000);
await shotEl("p01-menu", "aside", 0);
await go("/portal-do-cliente", 4000);
await shot("p02-portal");
await ev(
  `[...document.querySelectorAll("h2, h3")].find((e) => e.textContent.includes("Divulgação"))?.scrollIntoView({ block: "center" })`,
);
await sleep(600);
await shot("p03-portal-divulgacao");

await go("/servicos", 4000);
await click(
  `document.querySelector('button[aria-label="Alterar Massagem relaxante"]')`,
);
await sleep(1500);
await ev(
  `[...document.querySelectorAll("legend")].find((e) => e.textContent.includes("Profissionais que atendem"))?.scrollIntoView({ block: "center" })`,
);
await sleep(500);
await shotDialog("p04-servico-profissionais");
await closeDialogs();

await go(`/clientes?q=${encodeURIComponent(AURORA_APP.name)}`, 4000);
await shot("p05-clientes");
await click(
  `document.querySelector('button[aria-label="Acesso ao portal de ${AURORA_APP.name}"]')`,
);
await sleep(1200);
await clickText("button", "Gerar link");
await sleep(2500);
await shotDialog("p06-acesso-portal");
await closeDialogs();

await go(`/clientes/${ana.id}`, 4500);
await shot("p07-historico-nao-confirmado");

// O horário que a Ana marcou pelo app, aberto na agenda.
await go("/?date=2026-11-09", 4500);
await scrollAgenda("08:00");
await sleep(500);
await click(
  `[...document.querySelectorAll("[aria-label]")].find((e) => e.getAttribute("aria-label").includes(${JSON.stringify(AURORA_APP.name)}))`,
);
await sleep(1500);
await shotDialog("p08-agenda-portal");
await closeDialogs();

// ---- Mensagens
await go("/mensagens/automaticas", 4000);
await shot("m01-automaticas");
await viewport(1440, 1000);
await go("/mensagens/enviar", 4000);
await fill("#campaign-title", "Semana do Pilates");
await fill(
  "#campaign-body",
  "Olá {nome}! Nesta semana, a aula experimental de Pilates é por nossa conta. Agende pelo app. {estabelecimento}",
);
await sleep(800);
await shot("m02-enviar");
await clickText("button", "Enviar");
await sleep(900);
await shotDialog("m03-enviar-confirmar");
await closeDialogs();

process.exit(0);
