// Controle do Chrome (DevTools Protocol) para o manual: navegar, preencher,
// clicar e salvar capturas de tela limpas. Pede o Chrome já aberto em modo de
// depuração: google-chrome --headless=new --remote-debugging-port=9333
import { mkdirSync, writeFileSync } from "node:fs";

export const BASE = process.env.APP_URL ?? "http://localhost:3000";
const OUT = new URL("../images/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const targets = await (await fetch("http://127.0.0.1:9333/json")).json();
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id) pending.get(m.id)?.(m.result); };
export const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
await new Promise((r) => (ws.onopen = r));
await send("Page.enable");
await send("Network.enable");
// O indicador do Next em desenvolvimento (o "N" no canto) não pode aparecer nas imagens.
await send("Page.addScriptToEvaluateOnNewDocument", { source: `new MutationObserver(() => document.querySelectorAll("nextjs-portal").forEach((n) => n.remove())).observe(document, { childList: true, subtree: true });` });

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const ev = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.value;
export const viewport = (width, height, mobile = false) =>
  send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
export const go = async (path, ms = 3000) => { await send("Page.navigate", { url: BASE + path }); await sleep(ms); };
export const click = (js) => ev(`(() => { const el = ${js}; if (!el) return "NOT FOUND"; el.click(); return "ok"; })()`);
export const press = (js) => ev(`(() => { const el = ${js}; if (!el) return "NOT FOUND"; el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" })); return "ok"; })()`);
export const byText = (selector, text, exact = true) => `[...document.querySelectorAll(${JSON.stringify(selector)})].find((e) => ${exact ? `e.textContent.trim() === ${JSON.stringify(text)}` : `e.textContent.includes(${JSON.stringify(text)})`})`;
export const clickText = (selector, text, exact = true) => click(byText(selector, text, exact));
export const fill = (selector, value) => ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return "NOT FOUND"; const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event("input", { bubbles: true })); return "ok"; })()`);
export const text = (selector) => ev(`document.querySelector(${JSON.stringify(selector)})?.innerText.replace(/\\s+/g, " ")`);

/** Select do Radix: abre pelo gatilho e escolhe a opção pelo texto. */
export async function pickSelect(triggerSelector, optionText) {
  await press(`document.querySelector(${JSON.stringify(triggerSelector)})`); await sleep(500);
  await clickText("[role=option]", optionText, false); await sleep(400);
}
/** Combobox (cmdk): abre, busca e escolhe a opção pelo texto. */
export async function pickCombobox(triggerSelector, search, optionText = search) {
  await click(`document.querySelector(${JSON.stringify(triggerSelector)})`); await sleep(600);
  await ev(`(() => { const i = document.querySelector("[cmdk-input]"); if (!i) return; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, ${JSON.stringify(search)}); i.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await sleep(1200);
  await clickText("[cmdk-item]", optionText, false); await sleep(500);
}
export async function login(email, password) {
  await send("Network.clearBrowserCookies");
  await go("/login", 2500);
  await fill("input[name=email]", email); await fill("input[name=password]", password);
  await click(`document.querySelector("form button[type=submit]")`); await sleep(4500);
}

const png = async (name, clip) => {
  const { data } = await send("Page.captureScreenshot", { format: "png", ...(clip && { clip: { ...clip, scale: 1 } }) });
  writeFileSync(`${OUT}${name}.png`, Buffer.from(data, "base64"));
  console.log("  imagem:", name);
};
/** Tela inteira (a janela atual). */
export const shot = (name) => png(name);
/** Recorte em volta de um elemento (ex.: o diálogo aberto), com folga. */
export async function shotEl(name, selector, pad = 24) {
  const r = await ev(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; })()`);
  if (!r) throw new Error(`elemento não encontrado: ${selector}`);
  const x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad);
  await png(name, { x, y, width: r.w + (r.x - x) + pad, height: r.h + (r.y - y) + pad });
}
export const shotDialog = (name, pad = 28) => shotEl(name, "[role=dialog], [role=alertdialog]", pad);
export const closeDialogs = async () => { await ev(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`); await sleep(500); };
/** Rola a grade da agenda até a linha do horário (ex.: "07:30"). */
export const scrollAgenda = (time) => ev(`(() => { const label = [...document.querySelectorAll("*")].find((e) => e.children.length === 0 && e.textContent.trim() === ${JSON.stringify(time)}); if (!label) return "sem rótulo"; let box = label.parentElement; while (box && box.scrollHeight <= box.clientHeight + 4) box = box.parentElement; if (!box) return "sem rolagem"; box.scrollTop = label.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 70; return "ok"; })()`);
/** DatePicker: abre o calendário, avança os meses até a data e clica nela ("2026-12-24"). */
export async function pickDate(triggerSelector, isoDate) {
  await click(`document.querySelector(${JSON.stringify(triggerSelector)})`); await sleep(600);
  const [y, m, d] = isoDate.split("-").map(Number);
  for (let i = 0; i < 14; i++) {
    const found = await ev(`(() => { const b = [...document.querySelectorAll("[data-slot=popover-content] button[data-day]")].find((x) => x.dataset.day === ${JSON.stringify(isoDate)} || x.dataset.day === ${JSON.stringify(`${d}/${m}/${y}`)} || x.dataset.day === ${JSON.stringify(`${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`)}); if (!b || b.disabled) return false; b.click(); return true; })()`);
    if (found) { await sleep(500); return; }
    await click(`document.querySelector("[data-slot=popover-content] button[name=next-month], [data-slot=popover-content] button[aria-label*=róximo], [data-slot=popover-content] button[aria-label*=Next]")`); await sleep(350);
  }
  throw new Error(`data não encontrada no calendário: ${isoDate}`);
}
export const done = () => process.exit(0);
