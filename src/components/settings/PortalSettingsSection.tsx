"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  ADVANCE_OPTIONS,
  CANCEL_OPTIONS,
  formatCancelHours,
  formatMinutes,
  optionsWith,
} from "@/components/settings/portal-settings";
import { FormField } from "@/components/shared/FormField";
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
import type { BusinessSegment } from "@/types/portal";
import { BUSINESS_SEGMENTS } from "@/utils/business-segment";

/** Rascunho da seção: os dias à frente ficam em texto enquanto se digita. */
export type PortalDraft = {
  enabled: boolean;
  minAdvanceMinutes: number;
  maxDaysAhead: string;
  cancelUntilHours: number;
  listed: boolean;
  segment: BusinessSegment | null;
};

type PortalSettingsSectionProps = {
  value: PortalDraft;
  onChange: (next: PortalDraft) => void;
  /** Sem a ação Edita no plano: só leitura. */
  editable: boolean;
  /** Endereço do portal para divulgar. */
  url: string;
  daysError?: string;
  segmentError?: string;
};

/** Seção "Portal do cliente" das configurações (screens/configuracoes.md). */
export function PortalSettingsSection({
  value,
  onChange,
  editable,
  url,
  daysError,
  segmentError,
}: PortalSettingsSectionProps) {
  const set = (patch: Partial<PortalDraft>) => onChange({ ...value, ...patch });

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Endereço copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie o endereço.");
    }
  }

  return (
    <section className="space-y-4 border-t border-border p-4 md:p-6">
      <div>
        <h2 className="font-semibold">Portal do cliente</h2>
        <p className="text-sm text-muted-foreground">
          O cliente vê os horários livres e agenda sozinho pelo app. Entra pelo
          link de acesso (na ficha do cliente) ou, se a clínica aparece na
          busca, encontra o estabelecimento e se cadastra.
        </p>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium">
        <Switch
          checked={value.enabled}
          disabled={!editable}
          onCheckedChange={(enabled) => set({ enabled })}
          aria-label="Portal ligado"
        />
        {value.enabled ? "Portal ligado" : "Portal desligado"}
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="portal-advance" label="Antecedência mínima">
          <Select
            value={String(value.minAdvanceMinutes)}
            disabled={!editable}
            onValueChange={(next) => set({ minAdvanceMinutes: Number(next) })}
          >
            <SelectTrigger id="portal-advance" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {optionsWith(ADVANCE_OPTIONS, value.minAdvanceMinutes).map(
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
          error={daysError}
        >
          <Input
            id="portal-days"
            inputMode="numeric"
            value={value.maxDaysAhead}
            disabled={!editable}
            aria-invalid={Boolean(daysError) || undefined}
            onChange={(event) => set({ maxDaysAhead: event.target.value })}
          />
        </FormField>

        <FormField id="portal-cancel" label="O cliente cancela">
          <Select
            value={String(value.cancelUntilHours)}
            disabled={!editable}
            onValueChange={(next) => set({ cancelUntilHours: Number(next) })}
          >
            <SelectTrigger id="portal-cancel" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {optionsWith(CANCEL_OPTIONS, value.cancelUntilHours).map(
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1 sm:col-span-2">
          <label className="flex items-center gap-3 text-sm font-medium">
            <Switch
              checked={value.listed}
              disabled={!editable}
              onCheckedChange={(listed) => set({ listed })}
              aria-label="Aparecer na busca do app"
            />
            Aparecer na busca do app
          </label>
          <p className="text-sm text-muted-foreground">
            Quem se cadastra pela busca fica como não confirmado e pode ter até
            2 agendamentos futuros, até a clínica confirmar na ficha.
          </p>
        </div>

        <FormField id="portal-segment" label="Segmento" error={segmentError}>
          <Select
            value={value.segment ?? ""}
            disabled={!editable}
            onValueChange={(next) => set({ segment: next as BusinessSegment })}
          >
            <SelectTrigger
              id="portal-segment"
              className="w-full"
              aria-invalid={Boolean(segmentError) || undefined}
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
  );
}
