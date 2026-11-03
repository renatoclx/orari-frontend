import { AURORA } from "./demo-config.mjs";
import { clickText, closeDialogs, ev, go, login, pickCombobox, pickSelect, shotDialog, sleep, viewport } from "./cdp.mjs";

// Manual de Turmas: imagem 103 (Encaixar horário no horário de uma turma), no
// "Studio Aurora". Só abre o diálogo e escolhe o horário: nada é gravado.
const API = process.env.API_URL ?? "http://localhost:3333";
const token = (await (await fetch(API + "/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: AURORA.email, password: AURORA.password }) })).json()).accessToken;
const groups = (await (await fetch(API + "/class-groups?limit=100", { headers: { authorization: `Bearer ${token}` } })).json()).items;
const group = groups.find((g) => g.name === "Pilates 9h");
const professional = group.professional.name;

await viewport(1440, 1300);
await send_theme();
await login(AURORA.email, AURORA.password);
await go("/?date=2026-11-05", 4000);
await clickText("button", "Encaixar horário"); await sleep(900);
await pickCombobox("#appointment-client", "Rodrigo", "Rodrigo Pinto");
await pickCombobox("#appointment-service", "Massagem", "Massagem");
await pickSelect("#appointment-professional", professional);
// A data já vem preenchida pelo dia aberto na agenda (clicar nela de novo a desmarcaria).
await sleep(2000);
await clickText("button", "Pilates 9h", false); await sleep(800);
await ev(`[...document.querySelectorAll("[role=dialog] [role=status]")].pop()?.scrollIntoView({ block: "end" })`); await sleep(400);
await shotDialog("103-encaixe-em-turma");
await closeDialogs();
console.log("pronto");
process.exit(0);

async function send_theme() {
  const { send } = await import("./cdp.mjs");
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `try { localStorage.setItem("theme", "light"); } catch {}` });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
}
