"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "cn";
import { normalizeText } from "@/utils/text";

/** Opção da lista: `value` é o que o formulário guarda; `label`, o que o usuário vê. */
export type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  id: string;
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  /** Mostra "Carregando…" no lugar das opções. */
  loading?: boolean;
  /**
   * Busca no servidor: chamada a cada alteração do termo. Sem ela, a lista é
   * filtrada aqui, ignorando acentos e maiúsculas.
   */
  onSearchChange?: (term: string) => void;
};

// Caixa de seleção com busca. Para listas grandes (cidades), a busca é feita
// no servidor via `onSearchChange`.
export function Combobox({
  id,
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder = "Buscar…",
  emptyMessage = "Nenhum resultado.",
  disabled,
  loading,
  onSearchChange,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  const selected = options.find((option) => option.value === value);
  const visible = onSearchChange
    ? options
    : options.filter((option) =>
        normalizeText(option.label).includes(normalizeText(term)),
      );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setTerm("");
          onSearchChange?.("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between bg-transparent px-2.5 font-normal"
        >
          <span
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-56 p-0"
      >
        {/* A filtragem é nossa (acentos); o cmdk só cuida do teclado. */}
        <Command shouldFilter={false}>
          <CommandInput
            value={term}
            onValueChange={(next) => {
              setTerm(next);
              onSearchChange?.(next);
            }}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            {loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Carregando…
              </p>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                {visible.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto size-4",
                        option.value === value ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden="true"
                    />
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
