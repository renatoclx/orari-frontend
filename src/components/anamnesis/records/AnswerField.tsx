"use client";

import { cn } from "cn";
import {
  ANSWER_TEXT_MAX,
  type AnswerDraft,
} from "@/components/anamnesis/records/answer-form";
import { FormField } from "@/components/shared/FormField";
import { DatePicker } from "@/components/shared/DatePicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { AnamnesisQuestion } from "@/types/anamnesis";

type AnswerFieldProps = {
  /** Prefixo único dos ids dos elementos desta pergunta. */
  id: string;
  question: AnamnesisQuestion;
  value: AnswerDraft;
  onChange: (value: AnswerDraft) => void;
  error?: string;
  /** Marca com * as perguntas obrigatórias (só na ficha nova: no acompanhamento nenhuma é). */
  showRequired?: boolean;
};

// Botão de alternância (sim ou não e escala): pressionado = escolhido.
function ToggleButton({
  pressed,
  onClick,
  children,
  className,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-9 min-w-9 rounded-control border px-3 text-sm tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Campo de resposta de uma pergunta da ficha, conforme o tipo (os 8 tipos do
 * modelo). Edita um `AnswerDraft`; quem usa converte para o formato da API
 * (`parseAnswer`). Reaproveitado na nova ficha e no acompanhamento.
 */
export function AnswerField({
  id,
  question,
  value,
  onChange,
  error,
  showRequired = false,
}: AnswerFieldProps) {
  const required = showRequired && question.isRequired;
  const set = (patch: Partial<AnswerDraft>) => onChange({ ...value, ...patch });
  const label = `${question.position}. ${question.label}`;
  const invalid = error ? true : undefined;
  const help = question.helpText && (
    <p className="text-xs text-muted-foreground">{question.helpText}</p>
  );

  // Tipos com um único controle: o rótulo aponta para ele.
  if (
    question.type === "SHORT_TEXT" ||
    question.type === "LONG_TEXT" ||
    question.type === "NUMBER" ||
    question.type === "DATE"
  ) {
    return (
      <FormField id={id} label={label} required={required} error={error}>
        {question.type === "LONG_TEXT" ? (
          <Textarea
            id={id}
            rows={3}
            value={value.text}
            onChange={(event) => set({ text: event.target.value })}
            aria-invalid={invalid}
          />
        ) : question.type === "DATE" ? (
          <DatePicker
            id={id}
            name={id}
            maxDate={new Date()}
            initialValue={value.text}
            onValueChange={(text) => set({ text })}
          />
        ) : (
          <Input
            id={id}
            // Número: aceita vírgula (pt-BR), por isso texto com teclado numérico.
            inputMode={question.type === "NUMBER" ? "decimal" : undefined}
            maxLength={question.type === "SHORT_TEXT" ? ANSWER_TEXT_MAX : 30}
            value={value.text}
            onChange={(event) => set({ text: event.target.value })}
            autoComplete="off"
            aria-invalid={invalid}
          />
        )}
        {help}
      </FormField>
    );
  }

  // Tipos de escolha: um grupo, com o enunciado como rótulo do grupo.
  return (
    <div className="space-y-2">
      <p id={`${id}-label`} className="text-sm leading-none font-medium">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </p>
      {/* id e tabIndex: é para onde o foco vai quando a pergunta tem erro. */}
      <div
        id={id}
        tabIndex={-1}
        role={question.type === "MULTIPLE_CHOICE" ? "group" : undefined}
        aria-labelledby={`${id}-label`}
        className="space-y-2 outline-none"
      >
        {question.type === "YES_NO" && (
          <>
            <div className="flex gap-2">
              {(
                [
                  ["yes", "Sim"],
                  ["no", "Não"],
                ] as const
              ).map(([option, text]) => (
                <ToggleButton
                  key={option}
                  pressed={value.yesNo === option}
                  onClick={() =>
                    set({ yesNo: value.yesNo === option ? "" : option })
                  }
                  className="w-20"
                >
                  {text}
                </ToggleButton>
              ))}
            </div>
            {value.yesNo === "yes" && question.detailLabel && (
              <FormField id={`${id}-detail`} label={question.detailLabel}>
                <Input
                  id={`${id}-detail`}
                  value={value.detail}
                  onChange={(event) => set({ detail: event.target.value })}
                  autoComplete="off"
                />
              </FormField>
            )}
          </>
        )}

        {question.type === "SCALE" && (
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 11 }, (_, number) => (
              <ToggleButton
                key={number}
                pressed={value.text === String(number)}
                onClick={() =>
                  set({
                    text: value.text === String(number) ? "" : String(number),
                  })
                }
              >
                {number}
              </ToggleButton>
            ))}
          </div>
        )}

        {question.type === "SINGLE_CHOICE" && (
          <RadioGroup
            value={value.text}
            onValueChange={(text) => set({ text })}
            aria-labelledby={`${id}-label`}
          >
            {question.options.map((option, index) => (
              <div key={option} className="flex items-center gap-2">
                <RadioGroupItem id={`${id}-o${index}`} value={option} />
                <Label htmlFor={`${id}-o${index}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "MULTIPLE_CHOICE" &&
          question.options.map((option, index) => (
            <div key={option} className="flex items-center gap-2">
              <Checkbox
                id={`${id}-o${index}`}
                checked={value.choices.includes(option)}
                onCheckedChange={(checked) =>
                  set({
                    choices: checked
                      ? [...value.choices, option]
                      : value.choices.filter((item) => item !== option),
                  })
                }
              />
              <Label htmlFor={`${id}-o${index}`} className="font-normal">
                {option}
              </Label>
            </div>
          ))}
      </div>
      {help}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
