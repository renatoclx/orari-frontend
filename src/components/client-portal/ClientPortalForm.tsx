"use client";

import { useState, useTransition } from "react";
import { Copy, Save, X } from "lucide-react";
import { toast } from "sonner";
import { savePortalSettingsAction } from "@/app/(admin)/client-portal-actions";
import {
  ADVANCE_OPTIONS,
  CANCEL_OPTIONS,
  daysAheadError,
  formatCancelHours,
  formatMinutes,
  optionsWith,
  samePortalSettings,
  segmentError,
} from "@/components/client-portal/portal-settings";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { BusinessSegment, PortalSettings } from "@/types/portal";
import { BUSINESS_SEGMENTS } from "@/utils/business-segment";

/** Rascunho do formulário: os dias à frente ficam em texto enquanto se digita. */
type Draft = Omit<PortalSettings, "maxDaysAhead"> & { maxDaysAhead: string };

const toDraft = (settings: PortalSettings): Draft => ({
  ...settings,
  maxDaysAhead: String(settings.maxDaysAhead),
});

const fromDraft = (draft: Draft): PortalSettings => ({
  ...draft,
  maxDaysAhead: Number(draft.maxDaysAhead),
});

type ClientPortalFormProps = {
  settings: PortalSettings;
  /** Sem a ação Edita no plano: só leitura. */
  editable: boolean;
  /** Endereço do estabelecimento no app, para divulgar. */
  url: string;
};

/** Os blocos da tela Portal do cliente (screens/portal-do-cliente.md). */
export function ClientPortalForm({
  settings,
  editable,
  url,
}: ClientPortalFormProps) {
  const [draft, setDraft] = useState(() => toDraft(settings));
  const [errors, setErrors] = useState<{ days?: string; segment?: string }>({});
  const [pending, startTransition] = useTransition();

  // Dias à frente inválidos contam como mudança: o salvar acusa o erro.
  const changed =
    daysAheadError(draft.maxDaysAhead) !== undefined ||
    !samePortalSettings(fromDraft(draft), settings);

  const set = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  function discard() {
    setDraft(toDraft(settings));
    setErrors({});
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = {
      days: daysAheadError(draft.maxDaysAhead),
      segment: segmentError(draft),
    };
    setErrors(found);
    if (found.days || found.segment) {
      toast.error("Corrija os campos destacados.");
      return;
    }
    startTransition(async () => {
      const result = await savePortalSettingsAction(fromDraft(draft));
      if (result.ok) toast.success("Portal do cliente salvo.");
      else
        toast.error("Não foi possível salvar o portal do cliente.", {
          description: result.message,
        });
    });
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Endereço copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie o endereço.");
    }
  }

  return (
    // O formulário é o card da página: o conteúdo rola e o rodapé fica fixo.
    <form
      noValidate
      onSubmit={submit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      <div className="min-h-0 flex-1 divide-y divide-border overflow-auto">
        <section className="space-y-3 p-4 md:p-6">
          <div>
            <h2 className="font-semibold">Ativação do Portal</h2>
            <p className="text-sm text-muted-foreground">
              Ligado, os clientes veem os horários livres e agendam sozinhos
              pelo aplicativo. Desligado, as funcionalidades ficam inativas para
              o estabelecimento.
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <Switch
              checked={draft.enabled}
              disabled={!editable}
              onCheckedChange={(enabled) => set({ enabled })}
              aria-label="Portal ligado"
            />
            {draft.enabled ? "Portal ligado" : "Portal desligado"}
          </label>
        </section>

        <section className="space-y-4 p-4 md:p-6">
          <div>
            <h2 className="font-semibold">Regras de agendamento</h2>
            <p className="text-sm text-muted-foreground">
              Valem para o que o cliente marca e cancela pelo app. Na agenda, a
              clínica continua sem essas regras.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="portal-advance" label="Antecedência mínima">
              <Select
                value={String(draft.minAdvanceMinutes)}
                disabled={!editable}
                onValueChange={(next) =>
                  set({ minAdvanceMinutes: Number(next) })
                }
              >
                <SelectTrigger id="portal-advance" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {optionsWith(ADVANCE_OPTIONS, draft.minAdvanceMinutes).map(
                    (minutes) => (
                      <SelectItem key={minutes} value={String(minutes)}>
                        {formatMinutes(minutes)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="portal-days"
              label="Agendar até (dias à frente)"
              error={errors.days}
            >
              <Input
                id="portal-days"
                inputMode="numeric"
                value={draft.maxDaysAhead}
                disabled={!editable}
                aria-invalid={Boolean(errors.days) || undefined}
                onChange={(event) => set({ maxDaysAhead: event.target.value })}
              />
            </FormField>

            <FormField id="portal-cancel" label="O cliente cancela">
              <Select
                value={String(draft.cancelUntilHours)}
                disabled={!editable}
                onValueChange={(next) =>
                  set({ cancelUntilHours: Number(next) })
                }
              >
                <SelectTrigger id="portal-cancel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {optionsWith(CANCEL_OPTIONS, draft.cancelUntilHours).map(
                    (hours) => (
                      <SelectItem key={hours} value={String(hours)}>
                        {formatCancelHours(hours)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </section>

        <section className="space-y-4 p-4 md:p-6">
          <div>
            <h2 className="font-semibold">Busca no app</h2>
            <p className="text-sm text-muted-foreground">
              Na busca, qualquer pessoa encontra o estabelecimento pelo nome e
              se cadastra sozinha. Esse cliente fica como não confirmado, com
              até 2 agendamentos futuros, até a clínica confirmar no histórico
              do cliente.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-3 self-end text-sm font-medium sm:col-span-2 sm:h-9">
              <Switch
                checked={draft.listed}
                disabled={!editable}
                onCheckedChange={(listed) => set({ listed })}
                aria-label="Aparecer na busca do app"
              />
              Aparecer na busca do app
            </label>
            <FormField
              id="portal-segment"
              label="Segmento"
              error={errors.segment}
            >
              <Select
                value={draft.segment ?? ""}
                disabled={!editable}
                onValueChange={(next) =>
                  set({ segment: next as BusinessSegment })
                }
              >
                <SelectTrigger
                  id="portal-segment"
                  className="w-full"
                  aria-invalid={Boolean(errors.segment) || undefined}
                >
                  <SelectValue placeholder="Escolha o segmento" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_SEGMENTS.map((segment) => (
                    <SelectItem key={segment.value} value={segment.value}>
                      {segment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </section>

        <section className="space-y-4 p-4 md:p-6">
          <div>
            <h2 className="font-semibold">Divulgação</h2>
            <p className="text-sm text-muted-foreground">
              Endereço do estabelecimento no app, para pôr no Instagram, no site
              ou no WhatsApp. Para quem já é cliente, gere o link de acesso pelo
              botão Acesso ao portal (QR code), na lista de Clientes.
            </p>
          </div>
          <FormField id="portal-url" label="Endereço no app">
            <div className="flex max-w-xl gap-2">
              <Input id="portal-url" value={url} readOnly className="min-w-0" />
              <Hint label="Copiar o endereço">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Copiar o endereço"
                  onClick={copyUrl}
                >
                  <Copy aria-hidden="true" />
                </Button>
              </Hint>
            </div>
          </FormField>
        </section>
      </div>

      {editable && (
        <FormFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending || !changed}
            onClick={discard}
          >
            <X aria-hidden="true" />
            Descartar alterações
          </Button>
          <Button type="submit" disabled={pending || !changed}>
            <Save aria-hidden="true" />
            {pending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </FormFooter>
      )}
    </form>
  );
}
