import Link from "next/link";
import { ArrowRight, CircleCheck, Circle } from "lucide-react";
import type { Onboarding } from "@/types/onboarding";
import { DismissOnboardingButton } from "./DismissOnboardingButton";
import {
  onboardingItems,
  progressPercent,
  progressText,
  showOnboarding,
} from "./onboarding";

/**
 * "Primeiros passos" no topo do Dashboard (screens/dashboard.md), para a clínica
 * nova: o progresso e cada passo levando à tela certa. Some sozinho quando os
 * obrigatórios estão feitos, ou quando o administrador a dispensa.
 */
export function OnboardingChecklist({
  onboarding,
}: {
  onboarding: Onboarding;
}) {
  if (!showOnboarding(onboarding)) return null;
  const items = onboardingItems(onboarding);

  return (
    <section
      aria-labelledby="onboarding-title"
      className="space-y-4 rounded-card border border-border bg-card p-4 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 id="onboarding-title" className="text-lg font-semibold">
            Primeiros passos
          </h2>
          <p className="text-sm text-muted-foreground">
            Deixe a clínica pronta para agendar. Cada passo leva à tela certa.
          </p>
        </div>
        <DismissOnboardingButton />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">{progressText(onboarding)}</p>
        <div
          role="progressbar"
          aria-label="Primeiros passos"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent(onboarding)}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progressPercent(onboarding)}%` }}
          />
        </div>
      </div>

      <ul className="grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="flex items-start gap-3 rounded-control border border-border p-3 hover:bg-muted"
            >
              {item.done ? (
                <CircleCheck
                  className="mt-0.5 size-5 shrink-0 text-success"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className="min-w-0 flex-1 text-sm">
                <span
                  className={`block font-medium ${
                    item.done ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {item.label}
                  {item.done && <span className="sr-only"> (feito)</span>}
                  {item.optional && (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · opcional
                    </span>
                  )}
                </span>
                <span className="block text-muted-foreground">{item.hint}</span>
              </span>
              {!item.done && (
                <ArrowRight
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
