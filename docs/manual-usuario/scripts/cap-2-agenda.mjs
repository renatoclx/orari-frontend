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

// detalhes e remanejar: um atendimento FUTURO e agendado (só ele tem Cancelar e
// Remanejar), buscado pela API para o script não depender de uma data fixa.
const API = process.env.API_URL ?? "http://localhost:3333";
const login_ = await (await fetch(`${API}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: DEMO.email, password: DEMO.password }) })).json();
const upcoming = (await (await fetch(`${API}/appointments?limit=50&order=asc&from=${new Date(Date.now() + 86_400_000).toISOString()}`, { headers: { authorization: `Bearer ${login_.accessToken}` } })).json()).items
  .find((a) => a.status === "SCHEDULED" && !a.recurringAppointmentId && !a.overBooking);
// dia no fuso da empresa (UTC-3)
const upcomingDay = new Date(new Date(upcoming.startAt).getTime() - 3 * 3_600_000).toISOString().slice(0, 10);
await go(`/?date=${upcomingDay}`, 3500);
await click(`[...document.querySelectorAll("div[role=button]")].find((d) => d.getAttribute("aria-label")?.includes(${JSON.stringify(upcoming.client.name)}))`); await sleep(1000);
await shotDialog("09-detalhes-agendamento");
await clickText("[role=dialog] button", "Remanejar"); await sleep(1200);
await shotDialog("10-remanejar");
await closeDialogs();
done();
