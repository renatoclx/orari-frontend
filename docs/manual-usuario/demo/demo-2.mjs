import { api } from "./lib-api.mjs";
import { context, iso, sql, sleep } from "./lib-demo.mjs";
const { t, services, profs, clients, methods } = await context();
const H = "Helena Duarte", M = "Marcos Almeida", B = "Beatriz Nogueira";
// [data (já no passado), hora, cliente, serviço, profissional, desfecho, pagamento]
// desfecho: COMPLETED | CANCELLED | NO_SHOW ; pagamento: método (pago) ou null (pendente)
const past = [
  ["2026-10-19", "09:00", "Camila Ferreira", "Limpeza de Pele", H, "COMPLETED", "PIX"],
  ["2026-10-19", "10:30", "Rafaela Costa", "Massagem Relaxante", M, "COMPLETED", "Cartão de crédito"],
  ["2026-10-19", "15:00", "Tatiane Barros", "Drenagem Linfática", B, "COMPLETED", null],
  ["2026-10-20", "09:00", "Juliana Mendes", "Peeling Facial", H, "COMPLETED", "PIX"],
  ["2026-10-20", "11:00", "Bruno Carvalho", "Consulta de Avaliação", M, "CANCELLED", null],
  ["2026-10-20", "15:30", "Renata Souza", "Design de Sobrancelhas", B, "COMPLETED", null],
  ["2026-10-21", "09:30", "Fernanda Rocha", "Limpeza de Pele", H, "COMPLETED", "Dinheiro"],
  ["2026-10-21", "10:30", "Larissa Moura", "Massagem Relaxante", M, "NO_SHOW", null],
  ["2026-10-21", "16:00", "Vanessa Teixeira", "Drenagem Linfática", B, "COMPLETED", null],
  ["2026-10-22", "08:30", "Aline Santos", "Consulta de Avaliação", H, "COMPLETED", "Cartão de débito"],
  ["2026-10-22", "15:00", "Carolina Pires", "Limpeza de Pele", B, "COMPLETED", null],
  ["2026-10-22", "16:30", "Patrícia Lima", "Peeling Facial", H, "COMPLETED", "PIX"],
  ["2026-10-23", "08:30", "Camila Ferreira", "Limpeza de Pele", H, "COMPLETED", "PIX"],
  ["2026-10-23", "09:30", "Juliana Mendes", "Massagem Relaxante", M, "COMPLETED", "Cartão de crédito"],
  ["2026-10-23", "10:30", "Rafaela Costa", "Drenagem Linfática", B, "COMPLETED", null],
  ["2026-10-23", "14:00", "Patrícia Lima", "Design de Sobrancelhas", H, "COMPLETED", null],
];
const plus7 = (d) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + 7); return x.toISOString().slice(0, 10); };
const created = [];
for (const [date, hhmm, client, service, prof, outcome, method] of past) {
  // criado uma semana à frente (a API não agenda no passado) e depois trazido de volta
  const a = await api("POST", "/appointments", { clientId: clients[client].id, professionalId: profs[prof].id, serviceId: services[service].id, startAt: iso(plus7(date), hhmm) }, t);
  created.push({ id: a.id, outcome, method, client, date });
}
for (const c of created) {
  sql(`update appointments set "startAt" = "startAt" - interval '7 days', "endAt" = "endAt" - interval '7 days', status = '${c.outcome}', "updatedAt" = now() where id = '${c.id}'`);
}
console.log("agendamentos do passado criados:", created.length);
// o job de cobrança (a cada 5 min) cria o pagamento pendente dos concluídos, com o vencimento no dia
const completed = created.filter((c) => c.outcome === "COMPLETED");
const deadline = Date.now() + 7 * 60_000;
let payments = [];
while (Date.now() < deadline) {
  const list = (await api("GET", "/payments?limit=100&status=PENDING", undefined, t)).items;
  payments = list.filter((p) => completed.some((c) => c.id === p.appointmentId));
  process.stdout.write(`\raguardando o job de cobrança: ${payments.length}/${completed.length}   `);
  if (payments.length === completed.length) break;
  await sleep(20_000);
}
console.log();
for (const c of completed.filter((c) => c.method)) {
  const p = payments.find((x) => x.appointmentId === c.id);
  if (!p) continue;
  await api("PATCH", "/payments/settle", { paymentIds: [p.id], paymentMethodId: methods[c.method].id, paidAt: iso(c.date, "12:00") }, t);
}
console.log("pagamentos pagos:", completed.filter((c) => c.method).length, "| pendentes:", completed.filter((c) => !c.method).length);
