import { AURORA } from "./demo-config.mjs";
import { click, clickText, closeDialogs, ev, fill, go, login, pickCombobox, pickDate, pickSelect, press, scrollAgenda, send, shot, shotDialog, shotEl, sleep, viewport } from "./cdp.mjs";

// Manual de Turmas (manual-turmas.html): imagens 81 a 102, no "Studio Aurora".
// Só abre telas e formulários: nada é gravado. As duas chamadas à API (aviso de
// vaga e recusa em lote) são recusadas por inteiro, sem encaixar ninguém.
const API = process.env.API_URL ?? "http://localhost:3333";
const call = async (path, token) => (await fetch(API + path, { headers: { authorization: `Bearer ${token}` } })).json();
const token = (await (await fetch(API + "/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: AURORA.email, password: AURORA.password }) })).json()).accessToken;
const recurrences = (await call("/recurring-appointments?limit=100", token)).items;
const mateus = recurrences.find((r) => r.client.name === "Mateus Ribeiro" && r.classGroupId && !r.classLeftAt).id;
const plans = (await call("/client-plans?limit=100", token)).items;
const larissa = plans.find((p) => p.client.name === "Larissa Teixeira").id;
const GROUP = "Turma de Pilates 9h";

await viewport(1440, 900);
// Tema claro, como nas imagens dos outros manuais: o next-themes lê o
// localStorage antes de pintar a página.
await send("Page.addScriptToEvaluateOnNewDocument", { source: `try { localStorage.setItem("theme", "light"); } catch {}` });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
await login(AURORA.email, AURORA.password);

// ---- capítulo 1: menu
await go("/turmas", 3800);
await shotEl("81-menu-turmas", "aside", 0);

// ---- capítulo 2: serviço que aceita turma
await go("/servicos", 3800);
await click(`document.querySelector('button[aria-label="Alterar Pilates"]')`); await sleep(1200);
await ev(`document.querySelector("#service-allows-classes")?.scrollIntoView({ block: "center" })`); await sleep(400);
await shotDialog("82-servico-aceita-turma");
await closeDialogs();

// ---- capítulo 3: cadastro
await go("/turmas", 3800);
await shot("83-turmas-lista");
await viewport(1440, 1000);
await go("/turmas/nova", 3800);
await fill("#class-group-name", "Pilates fim de tarde");
await pickCombobox("#class-group-service", "Pilates");
await pickSelect("#class-group-professional", "Juliana Prado");
await fill("#class-group-capacity", "5");
await clickText("button", "Adicionar horário", false); await sleep(500);
await ev(`(() => { const i = document.querySelector('input[aria-label="Início em Segunda-feira"]'); if (!i) return; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, "17:00"); i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new Event("change", { bubbles: true })); })()`); await sleep(500);
await shot("84-turma-nova");
await viewport(1440, 900);
await go("/turmas", 3800);
await press(`document.querySelector('button[aria-label="Mais ações para ${GROUP}"]')`); await sleep(500);
await clickText("[role=menuitem]", "Visualizar"); await sleep(3500);
await shotDialog("85-turma-visualizar");
await closeDialogs();

// ---- capítulo 4: turma na agenda
await go("/?date=2026-11-11", 4500);
await scrollAgenda("08:30");
await sleep(500);
await shot("86-agenda-bloco");
// O cartão do bloco abre ao passar o mouse ou com o foco do teclado.
await ev(`document.querySelector('[aria-label*="turma de Pilates"]').dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }))`);
await ev(`document.querySelector('[aria-label*="turma de Pilates"]').focus()`); await sleep(1200);
await shot("87-agenda-cartao");
await go("/?date=2026-11-23", 4500);
await scrollAgenda("08:30"); await sleep(500);
await shot("88-agenda-horario-vazio");
await go("/?date=2026-11-11", 4500);
await click(`document.querySelector('[aria-label*="turma de Pilates"]')`); await sleep(2500);
await shotDialog("89-sessao-dialog");

// ---- capítulo 5: adicionar alunos (agenda) — 1 vaga livre, 2 escolhidos: só o aviso
await pickCombobox("#class-session-client", "Rodrigo", "Rodrigo Pinto");
await pickCombobox("#class-session-client", "Henrique", "Henrique Castro");
await shotDialog("90-sessao-alunos-escolhidos");
await clickText("button", "Adicionar 2 alunos"); await sleep(800);
await shotDialog("91-sessao-aviso-vagas");
await closeDialogs();

// Turmas → Adicionar alunos: datas com vagas; recusa em lote (ninguém entra)
await go("/turmas", 3800);
await press(`document.querySelector('button[aria-label="Mais ações para ${GROUP}"]')`); await sleep(500);
await clickText("[role=menuitem]", "Adicionar alunos"); await sleep(3000);
await press(`document.querySelector("#enroll-slot")`); await sleep(700);
// Recorte em volta do diálogo e da lista de datas aberta (que fica fora dele).
await ev(`(() => { const a = document.querySelector("[role=dialog]").getBoundingClientRect(), b = document.querySelector("[role=listbox]").getBoundingClientRect(); const d = document.createElement("div"); d.id = "area-datas"; const left = Math.min(a.left, b.left), top = Math.min(a.top, b.top); Object.assign(d.style, { position: "fixed", left: left + "px", top: top + "px", width: Math.max(a.right, b.right) - left + "px", height: Math.max(a.bottom, b.bottom) - top + "px", pointerEvents: "none" }); document.body.appendChild(d); })()`);
await shotEl("92-adicionar-alunos-datas", "#area-datas", 28);
await ev(`document.querySelector("#area-datas")?.remove()`);
// 25/11 tem 2 vagas: a API recusa o Thiago (já está na sessão) e ninguém entra.
await clickText("[role=option]", "25/11 às 09:00", false); await sleep(500);
await pickCombobox("#enroll-client", "Thiago", "Thiago Azevedo");
await pickCombobox("#enroll-client", "Fernanda", "Fernanda Gomes");
await click(`document.querySelector('[role=dialog] button[type=submit]')`); await sleep(3000);
await shotDialog("93-adicionar-alunos-recusa");
await closeDialogs();

// ---- capítulo 6: recorrência e plano na turma
await viewport(1440, 1000);
await go("/recorrencias/nova", 3800);
await pickSelect("#recurrence-class", GROUP);
await pickCombobox("#recurrence-client", "Isabela", "Isabela Freitas");
await pickDate("#recurrence-start", "2026-11-19");
await pickDate("#recurrence-end", "2026-12-09");
await click(`[...document.querySelectorAll("#recurrence-days li")].find((li) => li.textContent.includes("Quarta-feira"))?.querySelector("[role=switch]")`); await sleep(500);
await shot("94-recorrencia-em-turma");
await viewport(1440, 900);
await go("/pacotes/contratacoes/nova", 3800);
await pickCombobox("#client-plan-client", "Isabela", "Isabela Freitas");
await pickSelect("#client-plan-plan", "Pilates");
await pickDate("#client-plan-start", "2026-11-19");
await pickSelect('[id$="-class"]', GROUP);
await click(`[...document.querySelectorAll('[id$="-days"] li')].find((li) => li.textContent.includes("Segunda-feira"))?.querySelector("[role=switch]")`); await sleep(500);
await ev(`document.querySelector('[id$="-class"]').closest(".rounded-control").scrollIntoView({ block: "center" })`); await sleep(400);
await ev(`(() => { const b = document.querySelector('[id$="-class"]').closest(".rounded-control"); b.id = "bloco-turma"; })()`);
await shotEl("95-contratacao-em-turma", "#bloco-turma", 16);

// ---- capítulo 7: cancelar sessão (só o diálogo de confirmação; nada é confirmado)
await go("/?date=2026-11-16", 4500);
await click(`document.querySelector('[aria-label*="turma de Pilates"]')`); await sleep(2500);
await clickText("button", "Cancelar sessão"); await sleep(800);
await fill("#cancel-session-note", "Feriado");
await sleep(300);
await shotEl("96-cancelar-sessao", "[role=alertdialog]", 28);
await closeDialogs(); await closeDialogs();
await go("/?date=2026-11-18", 4500);
await scrollAgenda("08:30"); await sleep(500);
await shot("97-sessao-cancelada");

// ---- capítulo 8: saída e reposição
await go(`/recorrencias/${mateus}`, 4500);
await shot("98-recorrencia-em-turma-sessoes");
await clickText("button", "Sair da turma"); await sleep(800);
await shotEl("99-sair-da-turma", "[role=alertdialog]", 28);
await closeDialogs();
await click(`document.querySelector('button[aria-label^="Repor em turma"]')`); await sleep(3000);
await press(`document.querySelector("#replace-slot")`); await sleep(700);
await shot("100-repor-em-turma");
await closeDialogs(); await closeDialogs();
await go(`/pacotes/contratacoes/${larissa}`, 4500);
await click(`[...document.querySelectorAll("button")].find((b) => b.textContent.includes("Ver sessões") || b.getAttribute("aria-label")?.startsWith("Ver sessões"))`); await sleep(3500);
await shotDialog("101-plano-reposicao");
await closeDialogs();
console.log("pronto");
process.exit(0);
