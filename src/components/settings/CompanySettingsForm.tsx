"use client";

import { useRef, useState, useTransition } from "react";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { saveCompanySettingsAction } from "@/app/(admin)/company-actions";
import { BusinessHoursField } from "@/components/settings/BusinessHoursField";
import {
  validateBusinessHours,
  type BusinessHourDraft,
} from "@/components/settings/business-hours-validation";
import { LogoUpload, type LogoChange } from "@/components/settings/LogoUpload";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BusinessHour } from "@/types/business-hour";

type CompanySettingsFormProps = {
  fantasyName: string | null;
  logoUrl: string | null;
  hours: BusinessHour[];
  /** Dados cadastrais (só leitura), exibidos entre a identidade e os horários. */
  details: React.ReactNode;
};

const toDrafts = (hours: BusinessHour[]): BusinessHourDraft[] =>
  hours.map((hour) => ({ key: hour.id, ...hour }));

// Para comparar com o que veio da API (a ordem das janelas não importa).
const snapshot = (drafts: BusinessHourDraft[]) =>
  JSON.stringify(
    drafts
      .map(({ id, weekDay, openAt, closeAt }) => [id, weekDay, openAt, closeAt])
      .sort(),
  );

/**
 * Configurações da empresa num formulário só: identidade (nome fantasia e logo)
 * e horários de funcionamento. Envia apenas o que mudou.
 */
export function CompanySettingsForm({
  fantasyName,
  logoUrl,
  hours,
  details,
}: CompanySettingsFormProps) {
  const [name, setName] = useState(fantasyName ?? "");
  const [nameError, setNameError] = useState<string>();
  const [logo, setLogo] = useState<LogoChange>({ removed: false });
  // Recria o campo da logo ao descartar (volta à cadastrada).
  const [logoVersion, setLogoVersion] = useState(0);
  const [drafts, setDrafts] = useState(() => toDrafts(hours));
  const [hourErrors, setHourErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const nextKey = useRef(1);

  const nameChanged = name.trim() !== (fantasyName ?? "");
  const logoChanged = Boolean(logo.file) || logo.removed;
  const hoursChanged = snapshot(drafts) !== snapshot(toDrafts(hours));
  const changed = nameChanged || logoChanged || hoursChanged;

  function discard() {
    setName(fantasyName ?? "");
    setNameError(undefined);
    setLogo({ removed: false });
    setLogoVersion((version) => version + 1);
    setDrafts(toDrafts(hours));
    setHourErrors({});
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateBusinessHours(drafts);
    setHourErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Corrija os horários destacados.");
      return;
    }

    const data = new FormData();
    if (nameChanged) data.set("fantasyName", name);
    if (logo.file) data.set("logo", logo.file);
    else if (logo.removed) data.set("removeLogo", "1");
    if (hoursChanged) data.set("hours", JSON.stringify(drafts));

    startTransition(async () => {
      const result = await saveCompanySettingsAction(data);
      if (result.ok) {
        toast.success("Configurações salvas.");
        return;
      }
      if (result.field === "fantasyName") setNameError(result.message);
      toast.error("Não foi possível salvar as configurações.", {
        description: result.message,
      });
    });
  }

  return (
    // O formulário é o card da página: o conteúdo rola e o rodapé fica fixo.
    <form
      noValidate
      onSubmit={submit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <section className="space-y-4 border-b border-border p-4 md:p-6">
          <div>
            <h2 className="font-semibold">Identidade</h2>
            <p className="text-sm text-muted-foreground">
              Como a empresa aparece no topo da tela.
            </p>
          </div>
          <div className="max-w-md">
            <FormField
              id="company-name"
              label="Nome fantasia"
              error={nameError}
            >
              <Input
                id="company-name"
                maxLength={100}
                value={name}
                aria-invalid={Boolean(nameError) || undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError(undefined);
                }}
                placeholder="Sem nome fantasia, aparece a razão social"
              />
            </FormField>
          </div>
          <FormField id="company-logo" label="Logo">
            <LogoUpload
              key={logoVersion}
              currentUrl={logoUrl}
              onChange={setLogo}
            />
          </FormField>
        </section>

        {details}

        <section className="p-4 md:p-6">
          <h2 className="font-semibold">Horários de funcionamento</h2>
          <p className="text-sm text-muted-foreground">
            Janelas de atendimento de cada dia. Para um intervalo (almoço),
            cadastre duas janelas. Dia sem janela fica fechado (só encaixe).
          </p>
          <div className="mt-2">
            <BusinessHoursField
              drafts={drafts}
              onChange={(next) => {
                setDrafts(next);
                setHourErrors({});
              }}
              errors={hourErrors}
              newKey={() => `new-${nextKey.current++}`}
            />
          </div>
        </section>
      </div>

      <FormFooter note="Agendamentos já marcados não mudam com os novos horários.">
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
    </form>
  );
}
