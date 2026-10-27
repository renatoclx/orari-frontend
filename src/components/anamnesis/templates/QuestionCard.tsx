"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
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
  onChange: (question: QuestionDraft) => void;
  onRemove: () => void;
  newKey: () => string;
};

/**
 * Cartão de uma pergunta, arrastável pela alça (dnd-kit: mouse, toque e
 * teclado). Os campos mudam com o tipo: opções nas escolhas e texto de detalhe
 * no sim ou não.
 */
export function QuestionCard({
  question,
  position,
  errors = {},
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
      <div className="mb-3 flex items-center gap-2">
        <Hint label="Arrastar para reordenar">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Reordenar a pergunta ${position}`}
            className="-ml-1 grid size-9 cursor-grab touch-none place-items-center rounded-control text-muted-foreground hover:bg-muted active:cursor-grabbing"
          >
            <GripVertical className="size-5" aria-hidden="true" />
          </button>
        </Hint>
        <span className="text-sm font-medium">Pergunta {position}</span>
        <Hint label={`Remover a pergunta ${position}`}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label={`Remover a pergunta ${position}`}
            onClick={onRemove}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </Hint>
      </div>

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
    </li>
  );
}
