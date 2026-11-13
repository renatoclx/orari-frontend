import "server-only";

import { apiFetch } from "@/services/api";
import type { PendingSummary } from "@/types/pending-summary";

/** As pendências de hoje (o bloco do Dashboard); só o ADMIN. */
export function getPendingSummary(): Promise<PendingSummary> {
  return apiFetch<PendingSummary>("/pending-summary");
}
