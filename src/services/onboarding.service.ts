import "server-only";

import { apiFetch } from "@/services/api";
import type { Onboarding } from "@/types/onboarding";

// Primeiros passos da clínica (backend: /onboarding); só o ADMIN.

export function getOnboarding(): Promise<Onboarding> {
  return apiFetch<Onboarding>("/onboarding");
}

/** Dispensa a lista de primeiros passos (só para quem pediu). */
export function dismissOnboarding(): Promise<void> {
  return apiFetch<void>("/onboarding/dismiss", { method: "PATCH" });
}
