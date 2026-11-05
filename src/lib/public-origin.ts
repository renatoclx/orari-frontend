import "server-only";

import { headers } from "next/headers";

/**
 * Endereço público do site (ex.: https://app.orariapp.com.br), para montar
 * links que a clínica divulga. Atrás do proxy, vale o que ele repassa.
 */
export async function publicOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
