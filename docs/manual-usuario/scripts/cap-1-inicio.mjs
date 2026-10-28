import { DEMO } from "./demo-config.mjs";
import { click, clickText, closeDialogs, done, go, login, press, scrollAgenda, shot, shotDialog, shotEl, sleep, viewport, send, ev } from "./cdp.mjs";

// Capítulos 1 e 2: primeiros passos e agenda.
await viewport(1440, 900);
await send("Network.clearBrowserCookies");
await go("/login", 2500);
await shot("01-login");

await login(DEMO.email, DEMO.password);
await viewport(1440, 1500);
await go(`/?date=${DEMO.today}`, 4000);
await scrollAgenda("07:30"); await sleep(400);
await shot("02-agenda-dia");

// menu do usuário
await viewport(1440, 900);
await press(`document.querySelector('button[aria-label^="Menu do usuário"]')`); await sleep(600);
await shotEl("03-menu-usuario", "[role=menu]", 30);
await closeDialogs();

// calendário do atalho
await click(`document.querySelector('button[aria-label="Abrir calendário"]')`); await sleep(700);
await shotEl("04-calendario", "[data-slot=popover-content]", 30);
await closeDialogs();

// recortes: menu lateral e atalhos da direita
await go(`/?date=${DEMO.today}`, 3500);
await shotEl("33-menu-lateral", "aside", 0);
await shotEl("34-atalhos", 'aside[aria-label="Atalhos rápidos"]', 16);
done();
