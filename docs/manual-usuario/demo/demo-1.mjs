import { api, login, upload, ADMIN } from "./lib-api.mjs";
const AV = new URL("./avatars/", import.meta.url).pathname;

// CNPJ válido, calculado
function cnpj(base) {
  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2], w2 = [6, ...w1];
  const dv = (s, w) => { const r = s.split("").reduce((t, c, i) => t + (c.charCodeAt(0) - 48) * w[i], 0) % 11; return r < 2 ? 0 : 11 - r; };
  const d1 = dv(base, w1); const d2 = dv(base + d1, w2); return base + d1 + d2;
}
const superToken = await login("super@teste.com", "Super#12345");

// 1) empresa e administradora
const companies = (await api("GET", "/companies?limit=100", undefined, superToken)).items;
let company = companies.find((c) => c.subdomain === "bem-estar-demo");
if (!company) {
  company = await api("POST", "/companies", {
    corporateReason: "Bem-Estar Estética e Saúde LTDA", fantasyName: "Clínica Bem-Estar",
    document: cnpj("987654320001"), foundationDate: "2019-03-12", subdomain: "bem-estar-demo", timezone: "America/Sao_Paulo",
  }, superToken);
  await api("POST", "/users", { name: "Helena Duarte", email: ADMIN.email, password: ADMIN.password, passwordConfirmation: ADMIN.password, type: "ADMIN", companyId: company.id }, superToken);
  console.log("empresa e administradora criadas:", company.id);
} else console.log("empresa já existe:", company.id);

const t = await login(ADMIN.email, ADMIN.password);

// 2) horário de funcionamento
const hours = await api("GET", "/business-hours?limit=100", undefined, t);
if ((hours.items ?? hours).length === 0) {
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const batch = days.flatMap((weekDay) => [
    { weekDay, openAt: "08:00", closeAt: "12:00" },
    { weekDay, openAt: "14:00", closeAt: "19:00" },
  ]);
  batch.push({ weekDay: "SATURDAY", openAt: "08:00", closeAt: "13:00" });
  await api("POST", "/business-hours/batch", batch, t);
  console.log("horários criados");
}

// 3) métodos de pagamento
const methods = (await api("GET", "/payment-methods?limit=50", undefined, t)).items;
for (const name of ["PIX", "Cartão de crédito", "Cartão de débito", "Dinheiro"]) {
  if (!methods.some((m) => m.name === name)) await api("POST", "/payment-methods", { name }, t);
}

// 4) serviços
const services = (await api("GET", "/services?limit=100", undefined, t)).items;
const wanted = [
  ["Limpeza de Pele", 180, 60, "#06b6d4", "Limpeza profunda com extração e máscara calmante."],
  ["Massagem Relaxante", 150, 50, "#10b981", "Massagem corporal para aliviar a tensão muscular."],
  ["Drenagem Linfática", 160, 60, "#8b5cf6", "Técnica manual para reduzir o inchaço e melhorar a circulação."],
  ["Design de Sobrancelhas", 60, 30, "#ec4899", "Modelagem e acabamento das sobrancelhas."],
  ["Peeling Facial", 220, 45, "#f59e0b", "Renovação da pele com ácidos suaves."],
  ["Consulta de Avaliação", 90, 40, "#3b82f6", "Avaliação inicial e plano de tratamento."],
];
for (const [name, price, duration, color, description] of wanted) {
  if (!services.some((s) => s.name === name)) await api("POST", "/services", { name, price, duration, color, description }, t);
}

// 5) pessoas
const people = async (type) => (await api("GET", `/people?type=${type}&limit=100`, undefined, t)).items;
const profs = await people("PROFESSIONAL");
const proList = [
  ["Helena Duarte", "11987650001", "helena"], ["Marcos Almeida", "11987650002", "marcos"], ["Beatriz Nogueira", "11987650003", "beatriz"],
];
for (const [name, phone, photo] of proList) {
  let p = profs.find((x) => x.name === name);
  if (!p) { p = await api("POST", "/people", { name, type: "PROFESSIONAL", phone }, t); await upload(`/people/${p.id}/photo`, "photo", `${AV}${photo}.png`, t); }
}
const clients = await people("CLIENT");
const clientList = [
  ["Camila Ferreira", "11991110001", "camila", "1988-04-12", "Professora"], ["Juliana Mendes", "11991110002", "juliana", "1992-09-03", "Advogada"],
  ["Rafaela Costa", "11991110003", "rafaela", "1990-01-25", "Designer"], ["Patrícia Lima", "11991110004", "patricia", "1985-11-30", "Contadora"],
  ["Fernanda Rocha", "11991110005", null, "1994-06-18", "Arquiteta"], ["Aline Santos", "11991110006", null, "1991-02-09", "Enfermeira"],
  ["Bruno Carvalho", "11991110007", "bruno", "1987-07-21", "Engenheiro"], ["Larissa Moura", "11991110008", null, "1996-12-05", "Estudante"],
  ["Tatiane Barros", "11991110009", null, "1989-03-14", "Empresária"], ["Renata Souza", "11991110010", null, "1983-08-27", "Médica"],
  ["Vanessa Teixeira", "11991110011", null, "1993-05-02", "Publicitária"], ["Carolina Pires", "11991110012", null, "1990-10-16", "Dentista"],
];
for (const [name, phone, photo, birth, profession] of clientList) {
  let p = clients.find((x) => x.name === name);
  if (!p) { p = await api("POST", "/people", { name, type: "CLIENT", phone, birthDate: birth, profession }, t); if (photo) await upload(`/people/${p.id}/photo`, "photo", `${AV}${photo}.png`, t); }
}
console.log("base pronta: serviços", (await api("GET", "/services?limit=100", undefined, t)).total, "| clientes", (await people("CLIENT")).length, "| profissionais", (await people("PROFESSIONAL")).length);
