import { DEMO } from "./demo-config.mjs";
import { click, clickText, closeDialogs, done, ev, fill, go, login, pickCombobox, pickSelect, press, scrollAgenda, shot, shotDialog, sleep, text, viewport } from "./cdp.mjs";

await viewport(1440, 900);
await login(DEMO.email, DEMO.password);

// filtro por profissional
await go(`/?date=${DEMO.today}`, 3500);
await pickSelect('[aria-label="Filtrar por profissional"], button:has(> span[data-placeholder])', "Helena Duarte").catch(() => {});
await sleep(800);
await scrollAgenda("08:00"); await sleep(300);
await shot("05-agenda-filtro");

// novo agendamento (segunda-feira)
await go("/?date=2026-10-26", 3500);
await clickText("button", "Novo Agendamento"); await sleep(900);
await shotDialog("06-novo-agendamento-vazio");
await pickCombobox("#appointment-client", "Camila", "Camila Ferreira");
await pickCombobox("#appointment-service", "Limpeza", "Limpeza de Pele");
await pickSelect("#appointment-professional", "Helena Duarte");
await sleep(1500);
console.log("campo de horário:", await text("#appointment-time"));
await shotDialog("07-novo-agendamento-horarios");
await closeDialogs();

// encaixe
await clickText("button", "Encaixar horário"); await sleep(900);
await shotDialog("08-encaixe");
await closeDialogs();

// detalhes e remanejar
await click(`[...document.querySelectorAll("div[role=button]")].find((d) => d.getAttribute("aria-label")?.includes("Vanessa Teixeira"))`); await sleep(1000);
await shotDialog("09-detalhes-agendamento");
await clickText("[role=dialog] button", "Remanejar"); await sleep(1200);
await shotDialog("10-remanejar");
await closeDialogs();
done();
