// Dados fictícios da Anamnese para o manual: dois modelos, fichas e acompanhamentos
// ligados a atendimentos que o demo-2 já criou, e um usuário vinculado a um
// profissional (para mostrar o menu dele). Rode depois dos demo-1..3.
// Idempotente: se o modelo "Anamnese Estética" já existe, nada é recriado.
import { api, login, ADMIN } from "./lib-api.mjs";

const t = await login(ADMIN.email, ADMIN.password);

// Usuário vinculado a um profissional (o menu dele só tem "Fichas preenchidas").
// Mesma senha da administradora; criado uma vez só (idempotente pelo e-mail).
export const PROFESSIONAL_EMAIL = "beatriz.nogueira@bemestar.demo";
const existing = (await api("GET", "/users?limit=100", undefined, t)).items;
if (!existing.some((u) => u.email === PROFESSIONAL_EMAIL && u.deletedAt === null)) {
  const beatriz = (await api("GET", "/people?type=PROFESSIONAL&limit=20", undefined, t)).items.find((p) => p.name === "Beatriz Nogueira");
  await api("POST", "/users", {
    name: "Beatriz Nogueira", email: PROFESSIONAL_EMAIL, type: "USER", peopleId: beatriz.id,
    password: ADMIN.password, passwordConfirmation: ADMIN.password,
  }, t);
  console.log("usuário vinculado a profissional criado:", PROFESSIONAL_EMAIL);
}

const templates = (await api("GET", "/anamnesis-templates?limit=50", undefined, t)).items;
if (templates.some((x) => x.name === "Anamnese Estética")) {
  console.log("Anamnese já criada. Nada foi feito.");
  process.exit(0);
}

// 1) modelos. O primeiro nasce sem "Observações" e ganha a pergunta depois: versão 2.
const estetica = await api("POST", "/anamnesis-templates", {
  name: "Anamnese Estética",
  description: "Avaliação inicial de pele, hábitos e cuidados em casa.",
  questions: [
    { label: "Queixa principal", type: "SHORT_TEXT", isRequired: true, helpText: "Em poucas palavras, o que mais incomoda." },
    { label: "Tipo de pele", type: "SINGLE_CHOICE", isRequired: true, options: ["Seca", "Normal", "Mista", "Oleosa"] },
    { label: "Possui alguma alergia?", type: "YES_NO", detailLabel: "A que?" },
    { label: "Usa protetor solar diariamente?", type: "YES_NO" },
    { label: "Cuidados em casa", type: "MULTIPLE_CHOICE", options: ["Limpeza", "Hidratante", "Protetor solar", "Esfoliação"] },
    { label: "Peso (kg)", type: "NUMBER" },
    { label: "Data da última limpeza de pele", type: "DATE" },
    { label: "Nível de sensibilidade", type: "SCALE", helpText: "0 é nenhuma sensibilidade; 10, muito sensível." },
  ],
}, t);
const corporal = await api("POST", "/anamnesis-templates", {
  name: "Avaliação Corporal",
  description: "Objetivo, rotina de exercícios e dores.",
  questions: [
    { label: "Objetivo do tratamento", type: "SHORT_TEXT", isRequired: true },
    { label: "Pratica atividade física?", type: "YES_NO", detailLabel: "Qual?" },
    { label: "Nível de dor muscular", type: "SCALE" },
    { label: "Observações", type: "LONG_TEXT" },
  ],
}, t);
const q1 = estetica.currentVersion.questions;
const q2 = corporal.currentVersion.questions;

// 2) pessoas e atendimentos já existentes
const clients = Object.fromEntries((await api("GET", "/people?type=CLIENT&limit=100", undefined, t)).items.map((c) => [c.name, c]));
const appointmentOn = async (client, date) => (await api("GET", `/appointments?clientId=${client.id}&limit=50`, undefined, t))
  .items.find((a) => a.startAt.slice(0, 10) === date)?.id;

// 3) fichas e acompanhamentos
const camila = clients["Camila Ferreira"], juliana = clients["Juliana Mendes"], rafaela = clients["Rafaela Costa"];
const fichaCamila = await api("POST", "/anamnesis", {
  clientId: camila.id, templateId: estetica.id, consultationDate: "2026-10-12",
  answers: [
    { questionId: q1[0].id, value: "Oleosidade e manchas na região da testa" },
    { questionId: q1[1].id, value: "Mista" },
    { questionId: q1[2].id, value: { answer: true, detail: "Perfume e corantes" } },
    { questionId: q1[3].id, value: { answer: false } },
    { questionId: q1[4].id, value: ["Limpeza", "Hidratante"] },
    { questionId: q1[5].id, value: 62 },
    { questionId: q1[6].id, value: "2026-08-20" },
    { questionId: q1[7].id, value: 7 },
  ],
}, t);
await api("POST", `/anamnesis/${fichaCamila.id}/entries`, {
  consultationDate: "2026-10-19", appointmentId: await appointmentOn(camila, "2026-10-19"),
  evolution: "Primeira sessão de limpeza de pele. Boa tolerância ao procedimento. Orientada a incluir protetor solar diário e manter a hidratação à noite.",
  answers: [{ questionId: q1[3].id, value: { answer: true } }, { questionId: q1[7].id, value: 5 }],
}, t);
await api("POST", `/anamnesis/${fichaCamila.id}/entries`, {
  consultationDate: "2026-10-23", appointmentId: await appointmentOn(camila, "2026-10-23"),
  evolution: "Segunda sessão. Oleosidade reduzida e pele menos reativa. Mantida a rotina de cuidados em casa; retorno em 15 dias.",
  answers: [{ questionId: q1[7].id, value: 3 }],
}, t);
await api("POST", "/anamnesis", {
  clientId: camila.id, templateId: corporal.id, consultationDate: "2026-10-21",
  answers: [
    { questionId: q2[0].id, value: "Reduzir a tensão nos ombros" },
    { questionId: q2[1].id, value: { answer: true, detail: "Pilates, duas vezes por semana" } },
    { questionId: q2[2].id, value: 6 },
  ],
}, t);

// versão 2 do modelo: acrescenta "Observações" ao final
await api("PATCH", `/anamnesis-templates/${estetica.id}`, {
  questions: [
    ...q1.map((q) => ({ label: q.label, type: q.type, isRequired: q.isRequired, ...(q.helpText && { helpText: q.helpText }), ...(q.options?.length && { options: q.options }), ...(q.detailLabel && { detailLabel: q.detailLabel }) })),
    { label: "Observações", type: "LONG_TEXT" },
  ],
}, t);

const v2 = (await api("GET", `/anamnesis-templates/${estetica.id}`, undefined, t)).currentVersion.questions;
const fichaJuliana = await api("POST", "/anamnesis", {
  clientId: juliana.id, templateId: estetica.id, consultationDate: "2026-10-20",
  answers: [
    { questionId: v2[0].id, value: "Poros dilatados e brilho excessivo" },
    { questionId: v2[1].id, value: "Oleosa" },
    { questionId: v2[2].id, value: { answer: false } },
    { questionId: v2[4].id, value: ["Limpeza", "Protetor solar"] },
    { questionId: v2[7].id, value: 4 },
    { questionId: v2[8].id, value: "Prefere atendimento no fim da tarde." },
  ],
}, t);
await api("POST", `/anamnesis/${fichaJuliana.id}/entries`, {
  consultationDate: "2026-10-23", appointmentId: await appointmentOn(juliana, "2026-10-23"),
  evolution: "Peeling facial bem tolerado, sem vermelhidão persistente. Recomendado evitar exposição solar nos próximos dias.",
}, t);
await api("POST", "/anamnesis", {
  clientId: rafaela.id, templateId: corporal.id, consultationDate: "2026-10-19",
  answers: [
    { questionId: q2[0].id, value: "Aliviar dores nas costas" },
    { questionId: q2[1].id, value: { answer: false } },
    { questionId: q2[2].id, value: 8 },
  ],
}, t);

console.log("Anamnese criada: 2 modelos, 4 fichas, 4 acompanhamentos.");
