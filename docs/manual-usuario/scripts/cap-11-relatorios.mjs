import { DEMO } from "./demo-config.mjs";
import { click, clickText, closeDialogs, done, ev, go, login, send, shot, shotDialog, shotEl, sleep, viewport } from "./cdp.mjs";

// Manual de Relatórios e Dashboard (manual-relatorios.html, imagens r01 a r12)
// e as telas que mudaram no Manual do administrador (28, 29 e 33: "Pagamentos"
// virou "Contas a receber"). Clínica Bem-Estar, período de outubro de 2026.
// SÓ LEITURA: abre telas e fecha os diálogos sem salvar.
const PERIODO = "de=2026-10-01&ate=2026-10-31";

await viewport(1440, 900);
// Tema claro, como nas imagens dos outros manuais.
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `try { localStorage.setItem("theme", "light"); } catch {}`,
});
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-color-scheme", value: "light" }],
});
await login(DEMO.email, DEMO.password);

// ---- Manual do administrador: menu lateral (recorte) e Contas a receber.
await go(`/?date=${DEMO.today}`, 4000);
await shotEl("33-menu-lateral", "aside", 0);
await go("/financeiro", 4000);
await shot("28-pagamentos");
await click(`[...document.querySelectorAll("tbody button")].find((b) => b.innerText.trim() === "Dar baixa")`); await sleep(1000);
await shotDialog("29-pagamento-baixa");
await closeDialogs();

// ---- Relatórios: o grupo aberto no menu.
await go(`/relatorios/financeiro?${PERIODO}`, 4500);
await shotEl("r01-menu-relatorios", "aside", 0);

// ---- Dashboard.
await viewport(1440, 1700);
await go(`/dashboard?${PERIODO}`, 6000);
await shot("r02-dashboard");

// ---- Um relatório por vez (página inteira, alta para caber gráficos e listas).
const reports = [
  ["r03-carteira", "/relatorios/carteira-clientes"],
  ["r04-recebiveis", "/relatorios/analise-de-recebiveis"],
  ["r05-agendamentos", "/relatorios/agendamentos"],
  ["r06-rankings", "/relatorios/rankings"],
  ["r07-financeiro", "/relatorios/financeiro"],
  ["r08-pacotes", "/relatorios/pacotes"],
  ["r09-perfil", "/relatorios/perfil-do-cliente"],
];
for (const [name, path] of reports) {
  await go(`${path}?${PERIODO}`, 6000);
  await shot(name);
}
await viewport(1440, 900);
done();
