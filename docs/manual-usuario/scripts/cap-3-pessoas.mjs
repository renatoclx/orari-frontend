import { DEMO } from "./demo-config.mjs";
import { click, clickText, closeDialogs, done, fill, go, login, press, shot, shotDialog, sleep, viewport } from "./cdp.mjs";
import { ids } from "./ids.mjs";

// Capítulos 3 e 4: clientes, profissionais e serviços.
await viewport(1440, 900);
await login(DEMO.email, DEMO.password);

await go("/clientes", 3500);
await shot("11-clientes-lista");

// cadastro rápido pelo atalho da barra lateral
await click(`document.querySelector('button[aria-label="Cadastrar cliente rapidamente"]')`); await sleep(900);
await fill("#quick-name", "Mariana Alves");
await fill("input[type=tel]", "11 98877-6655");
await shotDialog("12-cliente-rapido");
await closeDialogs();

// cadastro completo
await viewport(1440, 1000);
await go("/clientes/novo", 3500);
await fill("#name", "Mariana Alves"); await fill("#phone", "11988776655"); await fill("#email", "mariana@exemplo.com");
await sleep(500);
await shot("13-cliente-novo");

// histórico do cliente
await viewport(1440, 1100);
await go(`/clientes/${ids.camila}`, 4500);
await shot("14-cliente-historico");
await clickText("a", "Pacotes", false).catch(() => {}); await sleep(200);

// profissionais
await viewport(1440, 900);
await go("/profissionais", 3500);
await shot("15-profissionais-lista");

// serviços
await go("/servicos", 3500);
await shot("16-servicos-lista");
await clickText("button", "Novo serviço"); await sleep(900);
await fill("#service-name", "Hidratação Facial");
await sleep(300);
await shotDialog("17-servico-novo");
await closeDialogs();
done();
