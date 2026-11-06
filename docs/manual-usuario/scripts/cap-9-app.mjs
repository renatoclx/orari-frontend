import { AURORA_APP } from "./demo-config.mjs";
import {
  clickText,
  ev,
  fill,
  go,
  send,
  shot,
  sleep,
  viewport,
} from "./cdp.mjs";

// Manual do app do cliente (manual-app.html): imagens a01 a a13, no celular.
// GRAVA dados: cria a conta da cliente fictícia "Ana Demo" (AURORA_APP), entra
// no Studio Aurora e marca um horário. Pede o Aurora com "Aparecer na busca"
// ligado. Depois das capturas, apague o que foi criado (README, passo 8).
// Em duas partes: `node cap-9-app.mjs conta` (até o Menu) e, depois de pôr
// avisos de exemplo na caixa da Ana, `node cap-9-app.mjs avisos`.
const SLUG = "studio-aurora-demo";
const part = process.argv[2] ?? "conta";

// Escolhe o N-ésimo botão de um bloco do agendamento, pelo título do bloco.
const pick = (heading, index = 0) =>
  ev(
    `(() => { const h = [...document.querySelectorAll("h2")].find((e) => e.textContent.trim().startsWith(${JSON.stringify(heading)})); const b = h ? [...h.closest("section").querySelectorAll("button[aria-pressed]")] : []; if (!b[${index}]) return "NOT FOUND"; b[${index}].click(); return "ok"; })()`,
  );

await viewport(390, 844, true);
if (part === "conta") {
  await send("Network.clearBrowserCookies");

  // ---- entrar e criar conta
  await go("/app/entrar", 3500);
  await shot("a01-entrar");
  await go("/app/criar-conta", 3500);
  await fill("input[name=name]", AURORA_APP.name);
  await fill("input[name=phone]", AURORA_APP.phone);
  await fill("input[name=password]", AURORA_APP.password);
  await fill("input[name=passwordConfirmation]", AURORA_APP.password);
  await shot("a02-criar-conta");
  await clickText("button", "Criar conta");
  await sleep(5000);
  await shot("a03-inicio");

  // ---- buscar e entrar no estabelecimento
  await go("/app/buscar", 3500);
  await fill("input[type=search], input[placeholder*=nome]", "Aurora");
  await sleep(2500);
  await shot("a04-buscar");
  await go(`/app/local/${SLUG}`, 3500);
  await shot("a05-local");
  await clickText("button", "Entrar neste estabelecimento");
  await sleep(4500);
  await shot("a06-local-cliente");

  // ---- agendar
  await go(`/app/local/${SLUG}/agendar`, 4000);
  await pick("Serviço");
  await sleep(2000);
  await pick("Profissional");
  await sleep(2000);
  await pick("Dia", 3);
  await sleep(3000);
  await pick("Horário");
  await sleep(1500);
  await shot("a07-agendar");
  await ev(
    `[...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Confirmar"))?.click()`,
  );
  await sleep(5000);
  await shot("a08-inicio-agendado");

  // ---- agendamentos: a confirmação do cancelar (sem cancelar)
  await go("/app/agendamentos", 3500);
  await clickText("button", "Cancelar");
  await sleep(600);
  await shot("a09-agendamentos-cancelar");
  await clickText("button", "Manter");
  await sleep(400);

  // ---- menu, avisos e meus dados
  await go("/app/menu", 3500);
  await shot("a10-menu");
}

if (part === "avisos") {
  await go("/app/menu/avisos", 4000);
  await shot("a11-avisos");
  await ev(
    `document.getElementById("messages-title")?.scrollIntoView({ block: "start" })`,
  );
  await sleep(500);
  await shot("a11b-avisos-recebidos");
  await clickText("button", "Limpar");
  await sleep(600);
  await shot("a12-avisos-limpar");
  await clickText("button", "Manter");
  await sleep(400);
  await go("/app/menu/dados", 3500);
  await shot("a13-meus-dados");
}

process.exit(0);
