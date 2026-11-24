import { AURORA } from "./demo-config.mjs";
import { click, clickText, closeDialogs, done, ev, fill, go, login, pickSelect, press, send, shot, shotDialog, shotEl, sleep, viewport } from "./cdp.mjs";

// Manuais de Comissões (manual-comissoes.html, c01 a c10) e de Contas a pagar
// (manual-contas-a-pagar.html, f01 a f10), no "Studio Aurora". Antes: comissões
// em aberto da Camila e fornecedores com nomes de demonstração (README, passo 9).
// GRAVA um fechamento (para mostrar "Comissão fechada", o recibo e a conta
// gerada), que é apagado depois. O resto só abre telas e fecha sem salvar.
const CAMILA = "974a9227-e940-470f-8422-34472018c5c0";
const IMOBILIARIA = "2b3e04c1-8520-4d98-8ee4-f6c079f3fa3c";
const COMISSOES = `/financeiro/comissoes?profissional=${CAMILA}`;
const CONTAS = "/financeiro/contas-a-pagar";
const row = (text) => `[...document.querySelectorAll("tbody tr")].find((r) => r.innerText.includes(${JSON.stringify(text)}))`;

await viewport(1440, 900);
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `try { localStorage.setItem("theme", "light"); } catch {}`,
});
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-color-scheme", value: "light" }],
});
await login(AURORA.email, AURORA.password);

// ---- Comissões: regra no serviço e no profissional.
await go("/servicos", 3500);
await click(`document.querySelector('button[aria-label="Alterar Pilates"]')`); await sleep(1200);
await shotDialog("c01-servico-comissao");
await closeDialogs();
await go(`/profissionais/${CAMILA}/editar`, 4000);
// A chave fica no fim dos dados principais: rola até ela.
await ev(`document.getElementById("receivesCommission")?.scrollIntoView({ block: "center" })`); await sleep(500);
await shot("c02-profissional-recebe");

// ---- Tela Comissões.
await go("/financeiro/comissoes", 4500);
await shot("c03-comissoes");
await go(COMISSOES, 4500);
await shot("c04-comissoes-profissional");

// Lançar adiantamento: preenche e fecha sem lançar.
await clickText("button", "Lançar adiantamento"); await sleep(1800);
await fill("#advance-amount", "5000"); await sleep(300);
await pickSelect("#advance-method", "PIX");
await fill("#advance-note", "Vale");
await shotDialog("c05-adiantamento");
await closeDialogs();

// ---- Contas a pagar (antes de fechar: mostra a comissão em aberto).
await go("/fornecedores", 4000);
await shot("f01-fornecedores");
await go(`/fornecedores/${IMOBILIARIA}/editar`, 4500);
await shot("f02-fornecedor");
await go("/financeiro/categorias-de-despesa", 3500);
await shot("f03-categorias");
await go(CONTAS, 4500);
await shot("f04-contas");

// Nova conta: parcelada em 3, sem salvar.
await clickText("button", "Nova conta a pagar"); await sleep(1200);
await fill("#payable-description", "Cadeira de manicure");
await pickSelect("#payable-category", "Outros");
await fill("#payable-amount", "180000");
await click(`document.querySelector("#repeat-installments")`); await sleep(400);
await shotDialog("f05-nova-conta");
await closeDialogs();
await closeDialogs();

// Pagar uma conta, sem confirmar.
await click(`[...(${row("Internet")}).querySelectorAll("button")].find((b) => b.innerText.trim() === "Pagar")`); await sleep(1200);
await pickSelect("#payable-settle-method", "PIX");
await shotDialog("f06-pagar");
await closeDialogs();

// Seleção em lote (só marca).
await click(`(${row("Conta de água")}).querySelector("input[type=checkbox]")`);
await click(`(${row("Energia elétrica")}).querySelector("input[type=checkbox]")`); await sleep(500);
await shot("f07-lote");
await go(CONTAS, 4000);

// Menu ⋮ de uma conta. Pelo CDP o menu abre no canto da tela (o Radix não
// posiciona com o clique simulado): a imagem final saiu do Playwright, com
// clique real e recorte em volta do menu (README, passo 9).
await press(`document.querySelector('button[aria-label="Mais ações de Conta de água"]')`); await sleep(600);
await shotEl("f08-mais-acoes", "[role=menu]", 40);
await closeDialogs();

// ---- Fechar comissão pelo bloco do Contas a pagar (grava; apagado depois).
await click(`[...document.querySelectorAll("section button")].find((b) => b.innerText.includes("Fechar comissão"))`); await sleep(2500);
await pickSelect("#closing-method", "PIX");
await shotDialog("c06-fechar");
await clickText("button", "Fechar e gerar recibo", false); await sleep(3000);
await shotDialog("c07-fechada");
await closeDialogs();

await go(`${CONTAS}?status=pagas`, 4500);
await shot("f09-contas-comissao");
await go(`${COMISSOES}&aba=fechamentos`, 4500);
await shot("c08-fechamentos");
// Endereço do recibo, na aba Fechamentos (o link de imprimir).
const href = await ev(`document.querySelector('a[aria-label^="Imprimir recibo"]')?.getAttribute("href")`);
await go(`${COMISSOES}&aba=adiantamentos`, 4500);
await shot("c09-adiantamentos");

// Recibo do fechamento recém-feito (versão de impressão).
if (href) {
  await viewport(1000, 1400);
  await go(href, 4500);
  await shot("c10-recibo");
}
await viewport(1440, 900);
done();
