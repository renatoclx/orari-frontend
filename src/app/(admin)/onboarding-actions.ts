"use server";

import { ApiError } from "@/services/api";
import { dismissOnboarding } from "@/services/onboarding.service";

/** Dispensa a lista de primeiros passos; falha silenciosa (a lista volta se não gravou). */
export async function dismissOnboardingAction(): Promise<void> {
  try {
    await dismissOnboarding();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}
