"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  MAX_OPTIONS,
  OPTION_MAX,
  type OptionDraft,
} from "@/components/anamnesis/templates/template-validation";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OptionsFieldProps = {
  /** Prefixo dos ids (liga o erro ao campo e o foco ao primeiro item). */
  id: string;
  value: OptionDraft[];
  onChange: (options: OptionDraft[]) => void;
  newKey: () => string;
  invalid?: boolean;
};

/** Lista de opções de uma pergunta de escolha: digitar, adicionar e remover. */
export function OptionsField({
  id,
  value,
  onChange,
  newKey,
  invalid,
}: OptionsFieldProps) {
  function add() {
    const key = newKey();
    onChange([...value, { key, text: "" }]);
    // O campo novo só existe depois da renderização.
    requestAnimationFrame(() =>
      document.getElementById(`${id}-${key}`)?.focus(),
    );
  }

  return (
    <div className="space-y-2">
      {value.map((option, index) => (
        <div key={option.key} className="flex items-center gap-2">
          <Input
            id={`${id}-${option.key}`}
            value={option.text}
            maxLength={OPTION_MAX}
            onChange={(event) =>
              onChange(
                value.map((item) =>
                  item.key === option.key
                    ? { ...item, text: event.target.value }
                    : item,
                ),
              )
            }
            placeholder={`Opção ${index + 1}`}
            aria-label={`Opção ${index + 1}`}
            aria-invalid={invalid ? true : undefined}
            autoComplete="off"
          />
          <Hint label={`Remover a opção ${index + 1}`}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remover a opção ${index + 1}`}
              onClick={() =>
                onChange(value.filter((item) => item.key !== option.key))
              }
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </Hint>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={value.length >= MAX_OPTIONS}
        onClick={add}
      >
        <Plus aria-hidden="true" />
        Adicionar opção
      </Button>
    </div>
  );
}
