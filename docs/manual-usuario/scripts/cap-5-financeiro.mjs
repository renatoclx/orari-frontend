import { DEMO } from "./demo-config.mjs";
import { click, clickText, closeDialogs, done, ev, fill, go, login, pickSelect, shot, shotDialog, sleep, viewport, send } from "./cdp.mjs";

// Capítulos 7 e 8: financeiro e configurações; e o capítulo do celular.
await viewport(1440, 900);
await login(DEMO.email, DEMO.password);

await go("/financeiro/comandas", 3500);
await shot("26-comandas-lista");
await click(`[...document.querySelectorAll("tbody tr")].find((r) => r.innerText.includes("Larissa Moura"))?.querySelector("button")`); await sleep(1000);
await pickSelect("#checkout-method", "PIX");
await shotDialog("27-comanda-receber");
await closeDialogs();

await viewport(1440, 1000);
await go("/financeiro", 3800);
await shot("28-pagamentos");
await click(`document.querySelector("tbody button")`); await sleep(900);
await pickSelect("#settle-method", "PIX");
await shotDialog("29-pagamento-baixa");
await closeDialogs();

await viewport(1440, 900);
await go("/financeiro/metodos-de-pagamento", 3500);
await shot("30-metodos-lista");
await clickText("button", "Novo método de pagamento"); await sleep(800);
await fill("#payment-method-name", "Transferência bancária");
await shotDialog("31-metodo-novo");
await closeDialogs();

await viewport(1440, 1500);
await go("/configuracoes", 4000);
await shot("32-configuracoes");

// celular
await viewport(390, 844, true);
await go("/?date=2026-10-23", 4000);
await shot("40-m-agenda");
await click(`document.querySelector('button[aria-label="Abrir menu"]')`); await sleep(900);
await shot("41-m-menu");
await ev(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`); await sleep(500);
await go("/financeiro/comandas", 3500);
await shot("42-m-comandas");
await go("/?date=2026-10-26", 3500);
await clickText("button", "Novo Agendamento"); await sleep(1000);
await shot("43-m-novo-agendamento");
done();
