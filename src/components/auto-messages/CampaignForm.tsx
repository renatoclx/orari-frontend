"use client";

import { useRef, useState, useTransition } from "react";
import { Send, X } from "lucide-react";
import { toast } from "sonner";
import { sendCampaignAction } from "@/app/(admin)/message-campaign-actions";
import {
  MAX_BODY,
  insertVariable,
  previewMessage,
} from "@/components/auto-messages/auto-messages";
import {
  CAMPAIGN_VARIABLES,
  MAX_TITLE,
  campaignErrors,
  clientsLabel,
  type CampaignErrors,
} from "@/components/auto-messages/campaign";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CampaignAudience } from "@/types/message-campaign";

type CampaignFormProps = {
  audience: CampaignAudience;
  /** Ação Edita no plano. */
  editable: boolean;
  /** Portal ligado: sem ele, nada sai. */
  portalEnabled: boolean;
  placeName: string;
  /** O histórico, abaixo do formulário, dentro do mesmo card. */
  history: React.ReactNode;
};

const EMPTY = { title: "", body: "" };

/**
 * Mensagens → Enviar (screens/mensagens.md): título, texto com {nome} e
 * {estabelecimento}, exemplo ao vivo e o envio com confirmação (uma por dia).
 */
export function CampaignForm({
  audience,
  editable,
  portalEnabled,
  placeName,
  history,
}: CampaignFormProps) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState<CampaignErrors>({});
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Por que não dá para enviar agora (nulo: dá).
  const blocked = !portalEnabled
    ? "O portal do cliente está desligado: ligue-o em Portal do cliente para enviar."
    : !audience.canSendToday
      ? "Hoje já foi enviada uma mensagem. A próxima pode ser enviada amanhã."
      : audience.clients === 0
        ? "Nenhum cliente usa o app ainda: não há para quem enviar."
        : null;
  const canSend = editable && !blocked;

  const set = (patch: Partial<typeof fields>) => {
    setFields((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  // O botão da variável insere no cursor da mensagem (ver AutoMessageSection).
  function addVariable(variable: (typeof CAMPAIGN_VARIABLES)[number]) {
    const field = textarea.current;
    const selection = field
      ? { start: field.selectionStart, end: field.selectionEnd }
      : { start: fields.body.length, end: fields.body.length };
    const { body, caret } = insertVariable(fields.body, variable, selection);
    set({ body });
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(caret, caret);
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = campaignErrors(fields);
    setErrors(found);
    if (found.title || found.body) {
      toast.error("Corrija os campos destacados.");
      return;
    }
    setConfirming(true);
  }

  function send() {
    startTransition(async () => {
      const result = await sendCampaignAction(fields);
      setConfirming(false);
      if (!result.ok) {
        toast.error("Não foi possível enviar a mensagem.", {
          description: result.message,
        });
        return;
      }
      toast.success(
        `Mensagem enviada para ${clientsLabel(result.recipients)}.`,
      );
      setFields(EMPTY);
    });
  }

  const receivers = audience.clients - audience.promotionsOff;

  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      {/* relative: os inputs escondidos do Radix (Switch, Checkbox, Select) são
          absolutos; sem isso, aumentam a altura da página e ela rola. */}
      <div className="relative min-h-0 flex-1 divide-y divide-border overflow-auto">
        <section
          aria-labelledby="campaign-new"
          className="space-y-4 p-4 md:p-6"
        >
          <div>
            <h2 id="campaign-new" className="font-semibold">
              Nova mensagem
            </h2>
            <p className="text-sm text-muted-foreground">
              Vai para os {clientsLabel(receivers)} que usam o app do Orari
              {audience.promotionsOff > 0 &&
                ` (${clientsLabel(audience.promotionsOff)} desligaram as novidades e não recebem)`}
              . Você pode enviar uma mensagem por dia.
            </p>
          </div>
          {blocked && (
            <p role="status" className="text-sm font-medium text-destructive">
              {blocked}
            </p>
          )}

          <FormField id="campaign-title" label="Título" error={errors.title}>
            <Input
              id="campaign-title"
              value={fields.title}
              maxLength={MAX_TITLE}
              disabled={!canSend}
              aria-invalid={Boolean(errors.title) || undefined}
              onChange={(event) => set({ title: event.target.value })}
              placeholder="Ex.: Novidade para você, {nome}!"
            />
          </FormField>
          <FormField id="campaign-body" label="Mensagem" error={errors.body}>
            <Textarea
              ref={textarea}
              id="campaign-body"
              rows={4}
              value={fields.body}
              disabled={!canSend}
              aria-invalid={Boolean(errors.body) || undefined}
              aria-describedby={`campaign-count${errors.body ? " campaign-body-error" : ""}`}
              onChange={(event) => set({ body: event.target.value })}
            />
          </FormField>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {canSend && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm text-muted-foreground">Inserir:</span>
                {CAMPAIGN_VARIABLES.map((variable) => (
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
              id="campaign-count"
              className={`ml-auto text-xs tabular-nums ${
                fields.body.length > MAX_BODY
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {fields.body.length}/{MAX_BODY}
            </span>
          </div>
          {(fields.title || fields.body) && (
            <p className="rounded-control bg-muted px-3 py-2 text-sm">
              <span className="font-medium">Exemplo: </span>
              <span className="font-semibold">
                {previewMessage(fields.title, placeName)}
              </span>{" "}
              {previewMessage(fields.body, placeName)}
            </p>
          )}
        </section>

        {history}
      </div>

      {canSend && (
        <FormFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending || (!fields.title && !fields.body)}
            onClick={() => set(EMPTY)}
          >
            <X aria-hidden="true" />
            Limpar
          </Button>
          <Button type="submit" disabled={pending}>
            <Send aria-hidden="true" />
            Enviar
          </Button>
        </FormFooter>
      )}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Enviar mensagem"
        description={
          <>
            A mensagem vai agora para {clientsLabel(receivers)} e não pode ser
            desfeita. Você pode enviar uma mensagem por dia.
          </>
        }
        confirmLabel="Enviar"
        pendingLabel="Enviando…"
        pending={pending}
        icon={Send}
        onConfirm={send}
      />
    </form>
  );
}
