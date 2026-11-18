import "server-only";

import { apiFetch } from "@/services/api";
import type { PlatformDashboard } from "@/types/platform-dashboard";

/** Números do Painel da plataforma (só o SUPER_ADMIN): ver screens/painel.md. */
export function getPlatformDashboard(): Promise<PlatformDashboard> {
  return apiFetch<PlatformDashboard>("/platform/dashboard");
}
