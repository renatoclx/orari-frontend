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

/** Rascunho da seção: os dias à frente ficam em texto enquanto se digita. */
export type PortalDraft = {
  enabled: boolean;
  minAdvanceMinutes: number;
  maxDaysAhead: string;
  cancelUntilHours: number;
};

type PortalSettingsSectionProps = {
  value: PortalDraft;
  onChange: (next: PortalDraft) => void;
  /** Sem a ação Edita no plano: só leitura. */
  editable: boolean;
  /** Endereço do portal para divulgar. */
  url: string;
  daysError?: string;
};

/** Seção "Portal do cliente" das configurações (screens/configuracoes.md). */
export function PortalSettingsSection({
  value,
  onChange,
  editable,
  url,
  daysError,
}: PortalSettingsSectionProps) {
  const set = (patch: Partial<PortalDraft>) => onChange({ ...value, ...patch });

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Endereço do portal copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie o endereço.");
    }
  }

  return (
    <section className="space-y-4 border-t border-border p-4 md:p-6">
      <div>
        <h2 className="font-semibold">Portal do cliente</h2>
        <p className="text-sm text-muted-foreground">
          Página em que o cliente vê os horários livres e agenda sozinho. Só
          entra quem recebe da clínica o link de acesso (na ficha do cliente).
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

      <FormField id="portal-url" label="Endereço do portal">
        <div className="flex max-w-xl gap-2">
          <Input id="portal-url" value={url} readOnly className="min-w-0" />
          <Hint label="Copiar o endereço do portal">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copiar o endereço do portal"
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
