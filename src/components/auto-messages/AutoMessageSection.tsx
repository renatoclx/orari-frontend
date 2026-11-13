"use client";

import { useRef } from "react";
import {
  AUTO_MESSAGE_INFO,
  MAX_BODY,
  MISS_YOU_OPTIONS,
  REMINDER_OFFSET_OPTIONS,
  SUMMARY_HOUR_OPTIONS,
  SUMMARY_ITEM_OPTIONS,
  toggleSummaryItem,
  insertVariable,
  previewMessage,
  toggleOffset,
  type AutoMessageErrors,
  type MessageVariable,
} from "@/components/auto-messages/auto-messages";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AutoMessage } from "@/types/auto-message";

type AutoMessageSectionProps = {
  message: AutoMessage;
  errors: AutoMessageErrors;
  editable: boolean;
  /** Nome da clínica, para o exemplo. */
  placeName: string;
  onChange: (patch: Partial<AutoMessage>) => void;
};

/**
 * Uma situação da tela Mensagens → Automáticas (screens/mensagens.md): ligar,
 * as opções dela, o texto com os botões das variáveis e o exemplo ao vivo.
 */
export function AutoMessageSection({
  message,
  errors,
  editable,
  placeName,
  onChange,
}: AutoMessageSectionProps) {
  const info = AUTO_MESSAGE_INFO[message.kind];
  const textarea = useRef<HTMLTextAreaElement>(null);
  const id = `auto-${message.kind.toLowerCase()}`;

  // O botão da variável insere no cursor e devolve o foco ao texto, com o
  // cursor logo depois do que entrou (dá para seguir digitando).
  function addVariable(variable: MessageVariable) {
    const field = textarea.current;
    const selection = field
      ? { start: field.selectionStart, end: field.selectionEnd }
      : { start: message.body.length, end: message.body.length };
    const { body, caret } = insertVariable(message.body, variable, selection);
    onChange({ body });
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(caret, caret);
    });
  }

  return (
    <section aria-labelledby={`${id}-title`} className="space-y-4 p-4 md:p-6">
      <label className="flex items-start gap-3">
        <Switch
          checked={message.enabled}
          disabled={!editable}
          onCheckedChange={(enabled) => onChange({ enabled })}
          className="mt-0.5"
        />
        <span>
          <span id={`${id}-title`} className="block font-semibold">
            {info.title}
          </span>
          <span className="block text-sm text-muted-foreground">
            {info.when}
          </span>
        </span>
      </label>

      {message.kind === "REMINDER" && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            Enviar antes do horário
          </legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {REMINDER_OFFSET_OPTIONS.map(({ minutes, label }) => (
              <label key={minutes} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={message.reminderOffsets.includes(minutes)}
                  disabled={!editable}
                  onCheckedChange={() =>
                    onChange({
                      reminderOffsets: toggleOffset(
                        message.reminderOffsets,
                        minutes,
                      ),
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>
          {errors.offsets && (
            <p role="alert" className="text-sm text-destructive">
              {errors.offsets}
            </p>
          )}
        </fieldset>
      )}

      {message.kind === "MISS_YOU" && (
        <FormField id={`${id}-days`} label="Dias sem vir">
          <Select
            value={String(message.missYouDays ?? 30)}
            disabled={!editable}
            onValueChange={(days) => onChange({ missYouDays: Number(days) })}
          >
            <SelectTrigger id={`${id}-days`} className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MISS_YOU_OPTIONS.map((days) => (
                <SelectItem key={days} value={String(days)}>
                  {days} dias
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}

      {message.kind === "ADMIN_SUMMARY" && (
        <>
          <FormField id={`${id}-hour`} label="Hora do envio">
            <Select
              value={String(message.summaryHour ?? 8)}
              disabled={!editable}
              onValueChange={(hour) => onChange({ summaryHour: Number(hour) })}
            >
              <SelectTrigger id={`${id}-hour`} className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUMMARY_HOUR_OPTIONS.map((hour) => (
                  <SelectItem key={hour} value={String(hour)}>
                    {hour}h
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Itens do resumo</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {SUMMARY_ITEM_OPTIONS.map(({ item, label }) => (
                <label key={item} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={message.summaryItems.includes(item)}
                    disabled={!editable}
                    onCheckedChange={() =>
                      onChange({
                        summaryItems: toggleSummaryItem(
                          message.summaryItems,
                          item,
                        ),
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Só entram os itens que o plano da clínica libera (contas a pagar,
              contas a receber, comandas e clientes).
            </p>
            {errors.items && (
              <p role="alert" className="text-sm text-destructive">
                {errors.items}
              </p>
            )}
          </fieldset>
        </>
      )}

      <FormField id={`${id}-body`} label="Mensagem" error={errors.body}>
        <Textarea
          ref={textarea}
          id={`${id}-body`}
          value={message.body}
          rows={3}
          readOnly={!editable}
          aria-invalid={Boolean(errors.body) || undefined}
          aria-describedby={`${id}-count${errors.body ? ` ${id}-body-error` : ""}`}
          onChange={(event) => onChange({ body: event.target.value })}
        />
      </FormField>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {editable && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Inserir:</span>
            {info.variables.map((variable) => (
              <Button
                key={variable}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 font-mono text-xs"
                onClick={() => addVariable(variable)}
              >
                {`{${variable}}`}
              </Button>
            ))}
          </div>
        )}
        <span
          id={`${id}-count`}
          className={`ml-auto text-xs tabular-nums ${
            message.body.length > MAX_BODY
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {message.body.length}/{MAX_BODY}
        </span>
      </div>
      <p className="rounded-control bg-muted px-3 py-2 text-sm">
        <span className="font-medium">Exemplo: </span>
        {previewMessage(message.body, placeName)}
      </p>
    </section>
  );
}
