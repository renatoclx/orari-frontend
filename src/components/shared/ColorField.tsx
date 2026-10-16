"use client";

import { Hint } from "@/components/shared/Hint";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type ColorFieldProps = {
  id: string;
  /** Nome do campo no formulário; vazio quando não há cor. */
  name: string;
  /** Cor inicial, hexadecimal (ex.: "#3BB2F6"). */
  initialValue?: string | null;
};

// Cor opcional: seletor de cor do navegador, com opção de remover. O valor vai
// no formulário como hexadecimal, ou vazio quando não há cor.
export function ColorField({ id, name, initialValue }: ColorFieldProps) {
  const [color, setColor] = useState(initialValue ?? "");

  return (
    <div className="flex items-center gap-3">
      <Hint label="Clique para escolher a cor">
        <input
          id={id}
          type="color"
          value={color || "#cccccc"}
          onChange={(event) => setColor(event.target.value)}
          aria-label="Escolher cor"
          className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-transparent p-1"
        />
      </Hint>
      <input type="hidden" name={name} value={color} />

      {color ? (
        <>
          <span className="text-sm text-muted-foreground uppercase tabular-nums">
            {color}
          </span>
          <Button type="button" variant="ghost" onClick={() => setColor("")}>
            Remover
          </Button>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">Sem cor</span>
      )}
    </div>
  );
}
