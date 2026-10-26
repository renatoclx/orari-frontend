import { readFileSync } from "node:fs";
export const API = "http://localhost:3333";
export async function api(method, path, body, token) {
  const res = await fetch(API + path, {
    method,
    headers: { "content-type": "application/json", ...(token && { authorization: `Bearer ${token}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : undefined; } catch { data = text; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(data)}`);
  return data;
}
export async function login(email, password) {
  return (await api("POST", "/auth/login", { email, password })).accessToken;
}
export async function upload(path, field, file, token) {
  const form = new FormData();
  form.append(field, new Blob([readFileSync(file)], { type: "image/png" }), file.split("/").pop());
  const res = await fetch(API + path, { method: "POST", headers: { authorization: `Bearer ${token}` }, body: form });
  if (!res.ok) throw new Error(`upload ${path} → ${res.status} ${await res.text()}`);
}
export const ADMIN = { email: "helena@bemestar.demo", password: "Demo#Manual2026" };
