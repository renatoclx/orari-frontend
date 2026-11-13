// Primeiros passos da clínica nova (backend: GET /onboarding).

export type OnboardingStepKey =
  | "BUSINESS_HOURS"
  | "LOGO"
  | "SERVICE"
  | "PROFESSIONAL"
  | "CLIENT"
  | "APPOINTMENT"
  | "PORTAL";

export type OnboardingStep = {
  key: OnboardingStepKey;
  done: boolean;
  /** Fora do progresso (ex.: ligar o portal do cliente). */
  optional: boolean;
};

export type Onboarding = {
  /** O usuário dispensou a lista. */
  dismissed: boolean;
  /** Só os passos que o plano libera. */
  steps: OnboardingStep[];
  /** Passos obrigatórios feitos, e quantos há. */
  completed: number;
  total: number;
};
