"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { OptionsField } from "@/components/anamnesis/templates/OptionsField";
import {
  isChoiceType,
  questionTypeLabels,
  questionTypes,
} from "@/components/anamnesis/templates/question-types";
import {
  HELP_MAX,
  LABEL_MAX,
  type QuestionDraft,
  type QuestionErrors,
} from "@/components/anamnesis/templates/template-validation";
import { FormField } from "@/components/shared/FormField";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { QuestionType } from "@/types/anamnesis";

type QuestionCardProps = {
  question: QuestionDraft;
  /** Posição na lista, a partir de 1 (é a numeração da ficha). */
  position: number;
  errors?: QuestionErrors;
  /** Aberta (campos à mostra) ou recolhida (só a linha de resumo). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (question: QuestionDraft) => void;
  onRemove: () => void;
  newKey: () => string;
};

/**
 * Cartão de uma pergunta, arrastável pela alça (dnd-kit: mouse, toque e
 * teclado) e recolhível: recolhida, vira uma linha de resumo, o que facilita
 * reordenar listas longas. Os campos mudam com o tipo: opções nas escolhas e
 * texto de detalhe no sim ou não.
 */
export function QuestionCard({
  question,
  position,
  errors = {},
  open,
  onOpenChange,
  onChange,
  onRemove,
  newKey,
}: QuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.key });
  const id = `q-${question.key}`;
  // Recolhida, o erro ficaria escondido: a linha avisa.
  const hasError = Object.values(errors).some(Boolean);

  function set<K extends keyof QuestionDraft>(key: K, value: QuestionDraft[K]) {
    onChange({ ...question, [key]: value });
  }

  // Trocar o tipo descarta o que o novo tipo não aceita (opções, detalhe) e dá
  // duas opções vazias a quem passa a ser de escolha.
  function changeType(type: QuestionType) {
    onChange({
      ...question,
      type,
      options: isChoiceType(type)
        ? question.options.length > 0
          ? question.options
          : [
              { key: newKey(), text: "" },
              { key: newKey(), text: "" },
            ]
        : [],
      detailLabel: type === "YES_NO" ? question.detailLabel : "",
    });
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-control border bg-background p-3 md:p-4 ${
        isDragging
          ? "relative z-10 border-ring opacity-90 shadow-lg"
          : "border-border"
      }`}
    >
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <div className="flex items-center gap-2">
          <Hint label="Arrastar para reordenar">
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={`Reordenar a pergunta ${position}`}
              className="-ml-1 grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-control text-muted-foreground hover:bg-muted active:cursor-grabbing"
            >
              <GripVertical className="size-5" aria-hidden="true" />
            </button>
          </Hint>
          {/* A linha toda abre e fecha; a alça e a lixeira ficam fora dela. */}
          <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 rounded-control py-1 text-left hover:bg-muted/50">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {position}. {question.label.trim() || "Pergunta sem texto"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {questionTypeLabels[question.type]}
                {question.isRequired && " · Obrigatória"}
                {isChoiceType(question.type) &&
                  ` · ${question.options.length} opções`}
              </span>
            </span>
            {hasError && (
              <span className="shrink-0 text-xs font-medium text-destructive">
                Revise esta pergunta
              </span>
            )}
            <ChevronDown
              className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
          <Hint label={`Remover a pergunta ${position}`}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={`Remover a pergunta ${position}`}
              onClick={onRemove}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </Hint>
        </div>

        <CollapsibleContent className="mt-3">
          <div className="space-y-4">
            <FormField
              id={`${id}-label`}
              label="Pergunta"
              required
              error={errors.label}
            >
              <Input
                id={`${id}-label`}
                value={question.label}
                maxLength={LABEL_MAX}
                onChange={(event) => set("label", event.target.value)}
                placeholder="Ex.: Tem alguma alergia?"
                autoComplete="off"
                aria-invalid={errors.label ? true : undefined}
              />
            </FormField>

            <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
              <FormField id={`${id}-type`} label="Tipo de resposta">
                <Select
                  value={question.type}
                  onValueChange={(next) => changeType(next as QuestionType)}
                >
                  <SelectTrigger id={`${id}-type`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {questionTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <div className="flex h-10 items-center gap-2">
                <Switch
                  id={`${id}-required`}
                  checked={question.isRequired}
                  onCheckedChange={(checked) => set("isRequired", checked)}
                />
                <Label htmlFor={`${id}-required`}>Obrigatória</Label>
              </div>
            </div>

            {isChoiceType(question.type) && (
              <FormField
                id={`${id}-options`}
                label="Opções"
                required
                error={errors.options}
              >
                <OptionsField
                  id={`${id}-option`}
                  value={question.options}
                  onChange={(options) => set("options", options)}
                  newKey={newKey}
                  invalid={Boolean(errors.options)}
                />
              </FormField>
            )}

            {question.type === "YES_NO" && (
              <FormField
                id={`${id}-detail`}
                label="Texto de detalhe (se a resposta for “sim”)"
                error={errors.detailLabel}
              >
                <Input
                  id={`${id}-detail`}
                  value={question.detailLabel}
                  maxLength={LABEL_MAX}
                  onChange={(event) => set("detailLabel", event.target.value)}
                  placeholder="Ex.: Qual?"
                  autoComplete="off"
                  aria-invalid={errors.detailLabel ? true : undefined}
                />
              </FormField>
            )}

            <FormField
              id={`${id}-help`}
              label="Texto de ajuda"
              error={errors.helpText}
            >
              <Input
                id={`${id}-help`}
                value={question.helpText}
                maxLength={HELP_MAX}
                onChange={(event) => set("helpText", event.target.value)}
                placeholder="Opcional: aparece junto da pergunta"
                autoComplete="off"
                aria-invalid={errors.helpText ? true : undefined}
              />
            </FormField>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
