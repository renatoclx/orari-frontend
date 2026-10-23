import { DEMO } from "./demo-config.mjs";
import { click, clickText, closeDialogs, done, ev, fill, go, login, pickCombobox, pickDate, pickSelect, shot, shotDialog, sleep, text, viewport } from "./cdp.mjs";
import { ids } from "./ids.mjs";

// Capítulos 5 e 6: recorrências e pacotes.
await viewport(1440, 900);
await login(DEMO.email, DEMO.password);

await go("/recorrencias", 3500);
await shot("18-recorrencias-lista");

await viewport(1440, 1250);
await go("/recorrencias/nova", 3500);
await pickCombobox("#recurrence-client", "Renata", "Renata Souza");
await pickCombobox("#recurrence-service", "Peeling", "Peeling Facial");
await pickSelect("#recurrence-professional", "Beatriz Nogueira");
await pickDate("#recurrence-start", "2026-10-28");
await pickDate("#recurrence-end", "2026-12-23");
await sleep(500);
console.log("campos de dias:", await ev(`[...document.querySelectorAll("label")].filter(l => /Segunda|Quarta/.test(l.textContent)).length`));
await click(`[...document.querySelectorAll("label")].find(l => l.textContent.includes("Quarta-feira"))?.querySelector("button, input, [role=switch]")`); await sleep(2500);
await shot("19-recorrencia-nova");

await viewport(1440, 1000);
await go(`/recorrencias/${ids.recorrencia}`, 4500);
await shot("20-recorrencia-detalhe");

await viewport(1440, 900);
await go("/pacotes/planos", 3500);
await shot("21-planos-lista");

await viewport(1440, 1300);
await go(`/pacotes/planos/${ids.plano}/editar`, 4500);
await shot("22-plano-form");

await viewport(1440, 900);
await go("/pacotes/contratacoes", 3500);
await shot("23-contratacoes-lista");

await viewport(1440, 1200);
await go(`/pacotes/contratacoes/${ids.contratacao}`, 4500);
await shot("24-contratacao-detalhe");

await viewport(1440, 1500);
await go("/pacotes/contratacoes/nova", 3500);
await pickCombobox("#client-plan-client", "Tatiane", "Tatiane Barros");
await pickSelect("#client-plan-plan", "Pele Perfeita");
await pickSelect("#client-plan-months", "3 meses");
await pickSelect("#client-plan-billing", "Mensal");
await pickDate("#client-plan-start", "2026-11-04");
await pickDate("#client-plan-due", "2026-11-20");
await sleep(1500);
await shot("25-contratacao-nova");
done();
