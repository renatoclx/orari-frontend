import "server-only";

import { cache } from "react";
import { proFetch } from "@/services/app-pro-api";

// Boas-vindas do profissional no app (backend: /onboarding/welcome e /dismiss).

/** O cartão de boas-vindas do Início já foi dispensado? */
export const getProWelcome = cache(() =>
  proFetch<{ dismissed: boolean }>("/onboarding/welcome"),
);

/** Dispensa o cartão (só para este usuário). */
export function dismissProWelcome(): Promise<void> {
  return proFetch<void>("/onboarding/dismiss", { method: "PATCH" });
}
