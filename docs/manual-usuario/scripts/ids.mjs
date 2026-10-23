// Ids da clínica de demonstração, buscados pela API (para abrir telas de detalhe).
import { DEMO } from "./demo-config.mjs";
const API = process.env.API_URL ?? "http://localhost:3333";
const call = async (path, token, init = {}) => (await fetch(API + path, { ...init, headers: { "content-type": "application/json", ...(token && { authorization: `Bearer ${token}` }) } })).json();
const { accessToken } = await call("/auth/login", undefined, { method: "POST", body: JSON.stringify({ email: DEMO.email, password: DEMO.password }) });
const find = async (path, name, key = "name") => (await call(`${path}${path.includes("?") ? "&" : "?"}limit=100`, accessToken)).items.find((x) => x[key] === name)?.id;
export const ids = {
  camila: await find("/people?type=CLIENT", "Camila Ferreira"),
  larissa: await find("/people?type=CLIENT", "Larissa Moura"),
  plano: await find("/plans", "Pele Perfeita"),
  contratacao: (await call("/client-plans?limit=10", accessToken)).items[0]?.id,
  recorrencia: (await call("/recurring-appointments?limit=20", accessToken)).items.find((r) => r.client?.name === "Juliana Mendes" || r.clientId)?.id,
};
