"use server";

import { ApiError } from "@/services/api";
import {
  dismissOnboarding,
  getOnboarding,
} from "@/services/onboarding.service";
import type { Onboarding } from "@/types/onboarding";

export type OnboardingResult =
  { ok: true; onboarding: Onboarding } | { ok: false };

/** Busca os primeiros passos para o dialog (que os pede ao abrir). */
export async function getOnboardingAction(): Promise<OnboardingResult> {
  try {
    return { ok: true, onboarding: await getOnboarding() };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false };
    throw error;
  }
}

/** Dispensa a lista de primeiros passos; falha silenciosa (a lista volta se não gravou). */
export async function dismissOnboardingAction(): Promise<void> {
  try {
    await dismissOnboarding();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}
