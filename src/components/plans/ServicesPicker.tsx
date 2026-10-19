"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MAX_SESSIONS_PER_WEEK,
  type PlanServiceDraft,
} from "@/components/plans/plan-validation";
import { cn } from "cn";
import { formatPrice } from "@/utils/format";
import { normalizeText } from "@/utils/text";

/** Serviço como o seletor o mostra; `priceCents` nulo = serviço sem preço. */
export type ServiceOption = {
  id: string;
  name: string;
  priceCents: number | null;
};

// "R$ 50,00" ou "sem preço".
const priceLabel = (option: ServiceOption) =>
  option.priceCents === null
    ? "sem preço"
    : formatPrice(option.priceCents / 100);

type ServicesPickerProps = {
  id: string;
  /** Serviços ativos que podem entrar no plano. */
  options: ServiceOption[];
  /** Serviços do plano que foram inativados (alteração): aparecem marcados. */
  inactive?: ServiceOption[];
  /** Serviços escolhidos, com os atendimentos por semana. */
  value: PlanServiceDraft[];
  onChange: (services: PlanServiceDraft[]) => void;
  invalid?: boolean;
};

// Opções de 1 a 7 atendimentos por semana.
const FREQUENCIES = Array.from(
  { length: MAX_SESSIONS_PER_WEEK },
  (_, i) => i + 1,
);

/**
 * Seleção de vários serviços com busca: a lista fica aberta enquanto se marca.
 * Cada escolhido vira uma linha com o preço avulso, os atendimentos por semana
 * e o botão de remover.
 */
export function ServicesPicker({
  id,
  options,
  inactive = [],
  value,
  onChange,
  invalid,
}: ServicesPickerProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  const visible = options.filter((option) =>
    normalizeText(option.name).includes(normalizeText(term)),
  );
  const all = [...options, ...inactive];
  const selected = (serviceId: string) =>
    value.some((item) => item.serviceId === serviceId);

  // Novo serviço entra com 1 atendimento por semana.
  function toggle(serviceId: string) {
    onChange(
      selected(serviceId)
        ? value.filter((item) => item.serviceId !== serviceId)
        : [...value, { serviceId, sessionsPerWeek: 1 }],
    );
  }

  function setFrequency(serviceId: string, sessionsPerWeek: number) {
    onChange(
      value.map((item) =>
        item.serviceId === serviceId ? { ...item, sessionsPerWeek } : item,
      ),
    );
  }

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setTerm("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid || undefined}
            className="w-full justify-between bg-transparent px-2.5 font-normal"
          >
            <span className="truncate text-muted-foreground">
              {value.length === 0
                ? "Selecione os serviços"
                : `${value.length} ${value.length === 1 ? "serviço selecionado" : "serviços selecionados"}`}
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
              onValueChange={setTerm}
              placeholder="Buscar serviço…"
            />
            <CommandList>
              <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
              {visible.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => toggle(option.id)}
                >
                  {option.name}
                  <span className="text-muted-foreground tabular-nums">
                    · {priceLabel(option)}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto size-4",
                      selected(option.id) ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <ul
          className="divide-y divide-border rounded-control border border-border"
          aria-label="Serviços do plano"
        >
          {value.map((item) => {
            const service = all.find((option) => option.id === item.serviceId);
            if (!service) return null;
            const isInactive = inactive.some(
              (option) => option.id === service.id,
            );
            return (
              <li
                key={service.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2"
              >
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm",
                    isInactive && "text-destructive",
                  )}
                >
                  {service.name}
                  {isInactive && " (inativo)"}
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    {priceLabel(service)} por atendimento
                  </span>
                </span>
                <Select
                  value={String(item.sessionsPerWeek)}
                  onValueChange={(next) =>
                    setFrequency(service.id, Number(next))
                  }
                >
                  <SelectTrigger
                    className="w-40"
                    aria-label={`Atendimentos por semana de ${service.name}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count}× por semana
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => toggle(service.id)}
                  aria-label={`Remover ${service.name}`}
                  className="rounded-control p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
