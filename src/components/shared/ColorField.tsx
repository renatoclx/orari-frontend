"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";

type ColorFieldProps = {
  id: string;
  /** Nome do campo no formulário; vazio quando não há cor. */
  name: string;
  /** Cor inicial, hexadecimal (ex.: "#3BB2F6"). */
  initialValue?: string | null;
};

// Paleta fixa: a cor do serviço é dado do cliente (vai no agendamento), não
// token da interface, por isso os hexadecimais ficam aqui e não no globals.css.
const PALETTE = [
  { value: "#EF4444", label: "Vermelho" },
  { value: "#F97316", label: "Laranja" },
  { value: "#F59E0B", label: "Âmbar" },
  { value: "#22C55E", label: "Verde" },
  { value: "#14B8A6", label: "Turquesa" },
  { value: "#22D3EE", label: "Ciano" },
  { value: "#2563EB", label: "Azul" },
  { value: "#8B5CF6", label: "Violeta" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#71717A", label: "Cinza" },
];

// Cor opcional, escolhida em círculos pré-definidos (sem bordas; a escolhida
// leva um ✓). O valor vai no formulário como hexadecimal, ou vazio quando não
// há cor.
export function ColorField({ id, name, initialValue }: ColorFieldProps) {
  const [color, setColor] = useState(initialValue ?? "");

  // Serviço antigo com cor fora da paleta: ela aparece como mais um círculo, para
  // que alterar o serviço não apague a cor sem querer.
  const custom =
    initialValue &&
    !PALETTE.some((c) => c.value.toLowerCase() === initialValue.toLowerCase())
      ? { value: initialValue, label: "Cor atual" }
      : null;
  const options = custom ? [custom, ...PALETTE] : PALETTE;

  return (
    <div id={id} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value.toLowerCase() === color.toLowerCase();
          return (
            <Hint key={option.value} label={option.label}>
              <button
                type="button"
                // Clicar na cor já escolhida a remove.
                onClick={() => setColor(selected ? "" : option.value)}
                aria-pressed={selected}
                aria-label={option.label}
                style={{ backgroundColor: option.value }}
                className="flex size-7 items-center justify-center rounded-full text-white transition-transform outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {selected && <Check className="size-4" aria-hidden="true" />}
              </button>
            </Hint>
          );
        })}
      </div>
      <input type="hidden" name={name} value={color} />

      {color ? (
        <Button type="button" variant="outline" onClick={() => setColor("")}>
          <Trash2 aria-hidden="true" />
          Remover cor
        </Button>
      ) : (
        <span className="text-sm text-muted-foreground">Sem cor</span>
      )}
    </div>
  );
}
