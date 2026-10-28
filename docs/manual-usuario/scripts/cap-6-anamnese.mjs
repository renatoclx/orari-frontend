import { DEMO } from "./demo-config.mjs";
import { click, clickText, closeDialogs, done, ev, fill, go, login, pickSelect, press, shot, shotDialog, shotEl, sleep, viewport, send } from "./cdp.mjs";

// Manual da Anamnese (manual-anamnese.html): imagens 51 a 71. Rode depois de
// demo/demo-4-anamnese.mjs.
const API = process.env.API_URL ?? "http://localhost:3333";
const call = async (path, token) => (await fetch(API + path, { headers: { authorization: `Bearer ${token}` } })).json();
const token = (await (await fetch(API + "/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: DEMO.email, password: DEMO.password }) })).json()).accessToken;
const clients = Object.fromEntries((await call("/people?type=CLIENT&limit=100", token)).items.map((c) => [c.name, c.id]));
const camila = clients["Camila Ferreira"], larissa = clients["Larissa Moura"];
const fichas = (await call(`/anamnesis?clientId=${camila}&limit=10`, token)).items;
const ficha = fichas.find((f) => f.template.name === "Anamnese Estética").id;
const templates = (await call("/anamnesis-templates?limit=20", token)).items;
const corporal = templates.find((x) => x.name === "Avaliação Corporal").id;
const estetica = templates.find((x) => x.name === "Anamnese Estética").id;
const fichaPath = `/clientes/${camila}/anamnese/${ficha}`;

await viewport(1440, 900);
await login(DEMO.email, DEMO.password);

// ---- capítulo 1: menu
await go("/anamnese/fichas", 3800);
await shotEl("51-menu-admin", "aside", 0);

// ---- capítulo 2: modelos
await go("/anamnese/modelos", 3800);
await shot("53-modelos-lista");

await viewport(1440, 1100);
await go("/anamnese/modelos/novo", 3800);
await fill("#template-name", "Anamnese Capilar");
await fill("#template-description", "Avaliação do couro cabeludo e dos fios.");
await fill('input[placeholder^="Ex.: Tem alguma"]', "Qual é a sua queixa principal?");
await sleep(400);
await shot("54-modelo-novo");

// edição do modelo com 8 perguntas, todas recolhidas
await go(`/anamnese/modelos/${estetica}/editar`, 4000);
await shot("56-modelo-recolhido");
// abre "Cuidados em casa" (escolha múltipla) para mostrar as opções
await ev(`[...document.querySelectorAll("button")].filter((b) => b.textContent.includes("Cuidados em casa"))[0]?.click()`); await sleep(700);
await viewport(1440, 1300);
await sleep(300);
// rola a lista até o início da pergunta aberta, para as opções aparecerem
await ev(`[...document.querySelectorAll("button")].filter((b) => b.textContent.includes("Cuidados em casa"))[0]?.scrollIntoView({ block: "start" })`);
await sleep(500);
await shot("55-modelo-opcoes");

// aviso da versão que será criada (modelo ainda na versão 1)
await viewport(1440, 1000);
await go(`/anamnese/modelos/${corporal}/editar`, 4000);
await shot("57-modelo-versao");

// visualizar pela lista
await viewport(1440, 900);
await go("/anamnese/modelos", 3800);
await press(`document.querySelector('button[aria-label="Mais ações para Anamnese Estética"]')`); await sleep(500);
await clickText("[role=menuitem]", "Visualizar"); await sleep(1000);
await shotDialog("58-modelo-visualizar");
await closeDialogs();

// ---- capítulo 3: fichas
await go("/anamnese/fichas", 3800);
await shot("59-fichas-lista");
await click(`document.querySelector('button[aria-label="Ver fichas de Camila Ferreira"]')`); await sleep(1500);
await shotDialog("60-fichas-dialog");
await closeDialogs();

await go("/anamnese/fichas/nova", 3800);
await shot("61-nova-ficha-cliente");

await viewport(1440, 1500);
await go(`/anamnese/fichas/nova?clienteId=${larissa}`, 4000);
await pickSelect("#anamnesis-template", "Anamnese Estética");
await sleep(800);
await shot("62-nova-ficha-form");

// ---- capítulo 4: ficha completa e acompanhamento
await viewport(1440, 1050);
await go(fichaPath, 4500);
await shot("63-ficha-completa");

await viewport(1440, 900);
await go(`${fichaPath}/acompanhamento`, 4000);
await fill("#entry-evolution", "Terceira sessão. Pele equilibrada, sem sinais de irritação. Mantida a rotina de cuidados em casa e agendado o retorno para o mês que vem.");
await sleep(400);
await shot("64-acompanhamento");
await viewport(1440, 1500);
await clickText("button", "Atualizar respostas da ficha", false); await sleep(900);
await shot("65-acompanhamento-respostas");

await viewport(1440, 900);
await go(`/clientes/${camila}?aba=anamnese`, 4000);
await shot("66-aba-anamnese-cliente");

// atalho no detalhe do agendamento (agenda de um dia com atendimento da Camila)
await viewport(1440, 1500);
await go("/?date=2026-10-23", 4000);
await click(`[...document.querySelectorAll("div[role=button]")].find((d) => d.getAttribute("aria-label")?.includes("Camila Ferreira"))`); await sleep(1200);
await shotDialog("67-atalho-agendamento");
await closeDialogs();

// ---- capítulo 5: PDF
await viewport(1440, 1000);
await go(fichaPath, 4500);
await clickText("button", "Imprimir"); await sleep(900);
await clickText("button", "Gerar PDF"); await sleep(5000);
await shotDialog("68-pdf-dialog");
await closeDialogs();

// ---- capítulo 6: auditoria (depois de tudo o que foi feito acima)
await viewport(1440, 900);
await go("/anamnese/auditoria", 4500);
await shot("69-auditoria");

// ---- celular
await viewport(390, 844, true);
await go(fichaPath, 4500);
await shot("70-m-ficha");
await go("/anamnese/fichas", 4000);
await shot("71-m-fichas");

// ---- capítulo 1: menu do profissional vinculado (só "Fichas preenchidas")
await viewport(1440, 900);
await login("beatriz.nogueira@bemestar.demo", DEMO.password);
await go("/anamnese/fichas", 3800);
await shotEl("52-menu-profissional", "aside", 0);

done();
