import { execSync } from "node:child_process";
import { api, login, ADMIN } from "./lib-api.mjs";
export const sql = (q) => execSync(`docker exec -u postgres orari_db psql -d orari -tAc ${JSON.stringify(q)}`).toString().trim();
// horário local de São Paulo (UTC-3) → instante UTC
export const iso = (date, hhmm) => { const [h, m] = hhmm.split(":").map(Number); const d = new Date(`${date}T00:00:00Z`); d.setUTCHours(h + 3, m); return d.toISOString(); };
export async function context() {
  const t = await login(ADMIN.email, ADMIN.password);
  const byName = async (path) => Object.fromEntries((await api("GET", `${path}${path.includes("?") ? "&" : "?"}limit=100`, undefined, t)).items.map((x) => [x.name, x]));
  const services = await byName("/services");
  const profs = await byName("/people?type=PROFESSIONAL");
  const clients = await byName("/people?type=CLIENT");
  const methods = await byName("/payment-methods");
  return { t, services, profs, clients, methods };
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
