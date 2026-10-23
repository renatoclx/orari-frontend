import { writeFileSync } from "node:fs";
const targets = await (await fetch("http://127.0.0.1:9333/json")).json();
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id) pending.get(m.id)?.(m.result); };
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
await new Promise((r) => (ws.onopen = r));
await send("Page.enable");
// silhueta simples sobre fundo em degradê; cada pessoa, uma cor
const people = {
  helena: ["#7dd3fc", "#0891b2"], marcos: ["#a7f3d0", "#059669"], beatriz: ["#fbcfe8", "#db2777"],
  camila: ["#fde68a", "#d97706"], juliana: ["#c4b5fd", "#7c3aed"], rafaela: ["#fecaca", "#dc2626"],
  bruno: ["#bfdbfe", "#2563eb"], patricia: ["#fed7aa", "#ea580c"],
};
for (const [name, [a, b]] of Object.entries(people)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="155" r="68" fill="#ffffff" fill-opacity="0.92"/><path d="M60 400c0-92 62-150 140-150s140 58 140 150z" fill="#ffffff" fill-opacity="0.92"/></svg>`;
  await send("Emulation.setDeviceMetricsOverride", { width: 400, height: 400, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "data:text/html;base64," + Buffer.from(`<html><body style="margin:0">${svg}</body></html>`).toString("base64") });
  await new Promise((r) => setTimeout(r, 400));
  const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 400, height: 400, scale: 1 } });
  writeFileSync(new URL(`./avatars/${name}.png`, import.meta.url), Buffer.from(data, "base64"));
}
process.exit(0);
