"use client";

import {
  ACCESS_ACTIONS,
  ACCESS_GROUPS,
  isActionApplicable,
  toggleAccess,
} from "@/components/companies/company-access";
import { Checkbox } from "@/components/ui/checkbox";
import type { AccessAction, AccessMatrix } from "@/types/company-access";

type AccessMatrixProps = {
  value: AccessMatrix;
  onChange: (next: AccessMatrix) => void;
};

// Mesma grade no cabeçalho e nas linhas (a partir do md): nome + 4 colunas.
const ROW_GRID = "md:grid-cols-[1fr_repeat(4,6.5rem)]";

/**
 * Matriz de funcionalidades × ações (screens/empresas.md). No celular cada
 * funcionalidade vira um bloco com os rótulos ao lado das caixas; a partir do
 * md, o rótulo vai para o cabeçalho e a linha fica só com as caixas.
 */
export function AccessMatrix({ value, onChange }: AccessMatrixProps) {
  return (
    <div className="rounded-control border border-border">
      <div
        aria-hidden="true"
        className={`hidden gap-x-3 border-b border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground md:grid ${ROW_GRID}`}
      >
        <span>Funcionalidade</span>
        {ACCESS_ACTIONS.map((action) => (
          <span key={action.key} className="text-center">
            {action.label}
          </span>
        ))}
      </div>

      {ACCESS_GROUPS.map((group) => (
        <section key={group.label}>
          <h3 className="border-b border-border bg-background px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase md:border-t-0">
            {group.label}
          </h3>
          <ul className="divide-y divide-border">
            {group.features.map((feature) => {
              const row = value[feature.key];
              return (
                <li
                  key={feature.key}
                  className={`grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-2.5 md:items-center ${ROW_GRID}`}
                >
                  <span className="col-span-2 text-sm font-medium md:col-span-1">
                    {feature.label}
                  </span>
                  {ACCESS_ACTIONS.map((action) => (
                    <AccessCell
                      key={action.key}
                      featureLabel={feature.label}
                      actionLabel={action.label}
                      applicable={isActionApplicable(feature.key, action.key)}
                      checked={row?.[action.key] ?? false}
                      // Sem Visualiza, as outras colunas ficam travadas.
                      disabled={action.key !== "view" && !row?.view}
                      onChange={(checked) =>
                        onChange(
                          toggleAccess(
                            value,
                            feature.key,
                            action.key as AccessAction,
                            checked,
                          ),
                        )
                      }
                    />
                  ))}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function AccessCell({
  featureLabel,
  actionLabel,
  applicable,
  checked,
  disabled,
  onChange,
}: {
  featureLabel: string;
  actionLabel: string;
  applicable: boolean;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  if (!applicable) {
    // Coluna que não existe na funcionalidade: só marca visual no md+.
    return (
      <span
        aria-hidden="true"
        className="hidden text-center text-muted-foreground md:block"
      >
        –
      </span>
    );
  }
  return (
    <label className="flex items-center gap-2 text-sm md:justify-center">
      <Checkbox
        checked={checked}
        disabled={disabled}
        aria-label={`${actionLabel}: ${featureLabel}`}
        onCheckedChange={(next) => onChange(next === true)}
      />
      {/* No md+ o rótulo está no cabeçalho da coluna. */}
      <span className="md:sr-only">{actionLabel}</span>
    </label>
  );
}
