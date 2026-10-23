import { api } from "./lib-api.mjs";
import { context, iso, sql } from "./lib-demo.mjs";
const { t, services, profs, clients } = await context();
const H = "Helena Duarte", M = "Marcos Almeida", B = "Beatriz Nogueira";
const future = [
  // hoje (sexta, 23/10), à tarde
  ["2026-10-23", "17:00", "Fernanda Rocha", "Limpeza de Pele", H], ["2026-10-23", "17:30", "Aline Santos", "Massagem Relaxante", M],
  ["2026-10-23", "18:00", "Bruno Carvalho", "Drenagem Linfática", B], ["2026-10-23", "18:30", "Larissa Moura", "Design de Sobrancelhas", H],
  // sábado
  ["2026-10-24", "09:00", "Tatiane Barros", "Consulta de Avaliação", H], ["2026-10-24", "10:30", "Renata Souza", "Limpeza de Pele", B],
  // segunda
  ["2026-10-26", "09:00", "Vanessa Teixeira", "Limpeza de Pele", H], ["2026-10-26", "10:30", "Carolina Pires", "Massagem Relaxante", M],
  ["2026-10-26", "14:00", "Camila Ferreira", "Peeling Facial", B], ["2026-10-26", "16:00", "Rafaela Costa", "Consulta de Avaliação", H],
  // terça
  ["2026-10-27", "09:00", "Patrícia Lima", "Limpeza de Pele", H], ["2026-10-27", "14:00", "Bruno Carvalho", "Consulta de Avaliação", M],
  ["2026-10-27", "15:30", "Fernanda Rocha", "Peeling Facial", H],
  // quarta
  ["2026-10-28", "10:30", "Tatiane Barros", "Massagem Relaxante", M], ["2026-10-28", "14:00", "Aline Santos", "Drenagem Linfática", B],
  ["2026-10-28", "16:30", "Renata Souza", "Design de Sobrancelhas", H],
  // quinta
  ["2026-10-29", "09:00", "Carolina Pires", "Consulta de Avaliação", H], ["2026-10-29", "11:00", "Rafaela Costa", "Limpeza de Pele", B],
  ["2026-10-29", "16:30", "Vanessa Teixeira", "Massagem Relaxante", M],
  // sexta
  ["2026-10-30", "08:30", "Camila Ferreira", "Design de Sobrancelhas", H], ["2026-10-30", "10:00", "Bruno Carvalho", "Limpeza de Pele", B],
  ["2026-10-30", "15:00", "Patrícia Lima", "Drenagem Linfática", M], ["2026-10-30", "17:00", "Fernanda Rocha", "Massagem Relaxante", M],
];
for (const [date, hhmm, client, service, prof] of future) {
  await api("POST", "/appointments", { clientId: clients[client].id, professionalId: profs[prof].id, serviceId: services[service].id, startAt: iso(date, hhmm) }, t);
}
// encaixe fora do horário (sábado à tarde)
await api("POST", "/appointments", { clientId: clients["Vanessa Teixeira"].id, professionalId: profs[H].id, serviceId: services["Design de Sobrancelhas"].id, startAt: iso("2026-10-24", "14:00"), overBooking: true, note: "Encaixe a pedido da cliente." }, t);
console.log("agendamentos futuros:", future.length + 1);

// recorrências
const rec = (client, service, prof, startDate, endDate, days, note) => api("POST", "/recurring-appointments", { clientId: clients[client].id, professionalId: profs[prof].id, serviceId: services[service].id, startDate, endDate, note, days }, t);
await rec("Camila Ferreira", "Massagem Relaxante", M, "2026-10-27", "2027-01-26", [{ weekDay: "TUESDAY", startTime: "10:00", endTime: "11:00" }], "Sessão semanal de relaxamento.");
await rec("Juliana Mendes", "Drenagem Linfática", B, "2026-10-26", "2026-12-24", [{ weekDay: "MONDAY", startTime: "15:00", endTime: "16:00" }, { weekDay: "THURSDAY", startTime: "15:00", endTime: "16:00" }], "Tratamento de duas sessões por semana.");
console.log("recorrências criadas");

// plano e contratação
const plan = await api("POST", "/plans", {
  name: "Pele Perfeita", description: "Limpeza de pele e design de sobrancelhas toda semana.", monthlyPrice: 520,
  services: [{ serviceId: services["Limpeza de Pele"].id, sessionsPerWeek: 1 }, { serviceId: services["Design de Sobrancelhas"].id, sessionsPerWeek: 1 }],
  periods: [{ months: 3, discountPercent: 10, monthlyDiscountPercent: 5 }, { months: 6, discountPercent: 12, monthlyDiscountPercent: 7 }],
}, t);
await api("POST", "/plans", {
  name: "Relax Mensal", description: "Massagem relaxante semanal.", monthlyPrice: 480,
  services: [{ serviceId: services["Massagem Relaxante"].id, sessionsPerWeek: 1 }],
  periods: [{ months: 3, discountPercent: 8, monthlyDiscountPercent: 4 }],
}, t);
const cp = await api("POST", "/client-plans", {
  clientId: clients["Larissa Moura"].id, planId: plan.id, months: 3, billingType: "MONTHLY", startDate: "2026-10-28", firstDueDate: "2026-11-10",
  schedules: [
    { serviceId: services["Limpeza de Pele"].id, professionalId: profs[H].id, days: [{ weekDay: "WEDNESDAY", startTime: "09:00", endTime: "10:00" }] },
    { serviceId: services["Design de Sobrancelhas"].id, professionalId: profs[B].id, days: [{ weekDay: "WEDNESDAY", startTime: "10:00", endTime: "10:30" }] },
  ],
}, t);
// uma parcela já vencida, para a tela de pagamentos mostrar um pacote atrasado
sql(`update payments set "dueDate" = '2026-10-15' where id = (select id from payments where "clientPlanId" = '${cp.id}' order by "dueDate" asc limit 1)`);
console.log("plano, contratação e parcela vencida criados");
