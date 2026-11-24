import type { Onboarding, OnboardingStepKey } from "@/types/onboarding";

// Regras puras da lista de primeiros passos (screens/dashboard.md): o texto e a
// tela de cada passo, e quando a lista aparece.

const INFO: Record<
  OnboardingStepKey,
  { label: string; hint: string; href: string }
> = {
  BUSINESS_HOURS: {
    label: "Defina o horário de funcionamento",
    hint: "A agenda só oferece horários dentro dele.",
    href: "/configuracoes",
  },
  LOGO: {
    label: "Coloque a logo da clínica",
    hint: "Ela aparece no topo do sistema.",
    href: "/configuracoes",
  },
  SERVICE: {
    label: "Cadastre um serviço",
    hint: "Com duração e preço.",
    href: "/servicos",
  },
  PROFESSIONAL: {
    label: "Cadastre um profissional",
    hint: "Quem atende na agenda.",
    href: "/profissionais/novo",
  },
  CLIENT: {
    label: "Cadastre um cliente",
    hint: "Ou deixe os clientes entrarem pelo app.",
    href: "/clientes/novo",
  },
  APPOINTMENT: {
    label: "Faça o primeiro agendamento",
    hint: "Na agenda, com o cliente, o serviço e o horário.",
    href: "/",
  },
  PORTAL: {
    label: "Ligue o portal do cliente",
    hint: "Opcional: o app em que o cliente agenda sozinho.",
    href: "/portal-do-cliente",
  },
};

export type OnboardingItem = {
  key: OnboardingStepKey;
  label: string;
  hint: string;
  href: string;
  done: boolean;
  optional: boolean;
};

/** Os passos com texto e tela, na ordem da API. */
export function onboardingItems({ steps }: Onboarding): OnboardingItem[] {
  return steps.map((step) => ({ ...step, ...INFO[step.key] }));
}

/** A lista aparece enquanto falta algum passo obrigatório e o usuário não a dispensou. */
export function showOnboarding(onboarding: Onboarding): boolean {
  return (
    !onboarding.dismissed &&
    onboarding.total > 0 &&
    onboarding.completed < onboarding.total
  );
}

/** "3 de 6 concluídos". */
export function progressText({ completed, total }: Onboarding): string {
  return `${completed} de ${total} concluídos`;
}

/** Largura da barra de progresso, de 0 a 100. */
export function progressPercent({ completed, total }: Onboarding): number {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}
