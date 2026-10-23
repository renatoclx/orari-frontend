"use client";

import { useState, useTransition } from "react";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  createCompanyAction,
  updateCompanyAction,
} from "@/app/(admin)/company-admin-actions";
import {
  DEFAULT_TIMEZONE,
  timezoneOptions,
} from "@/components/companies/company-timezones";
import {
  MAX_FANTASY_NAME,
  companyFieldOrder,
  documentKind,
  validateCompanyForm,
  type CompanyFormErrors,
  type CompanyFormValues,
} from "@/components/companies/company-validation";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Company } from "@/types/company";
import { normalizeDocument } from "@/utils/document";
import { formatDocument } from "@/utils/format";

type CompanyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente na alteração; sem isso, é o cadastro. */
  company?: Company;
  /** Depois de cadastrar: a lista abre o cadastro do administrador. */
  onCreated?: (company: { id: string; name: string }) => void;
};

// Id de cada campo: liga o erro ao elemento que recebe o foco.
const ids = (field: keyof CompanyFormValues) => `company-${field}`;

/**
 * Cadastro e alteração de empresa em dialog (screens/empresas.md). Só o
 * SUPER_ADMIN chega aqui; a logo, o nome fantasia e os horários são da própria
 * empresa, em Configurações.
 */
export function CompanyFormDialog(props: CompanyFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {/* O conteúdo só existe aberto: os campos começam limpos a cada vez. */}
        <CompanyForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function CompanyForm({
  onOpenChange,
  company,
  onCreated,
}: CompanyFormDialogProps) {
  const editing = company !== undefined;
  const [values, setValues] = useState<CompanyFormValues>({
    corporateReason: company?.corporateReason ?? "",
    fantasyName: company?.fantasyName ?? "",
    document: company ? formatDocument(company.document) : "",
    foundationDate: company?.foundationDate?.slice(0, 10) ?? "",
    subdomain: company?.subdomain ?? "",
    timezone: company?.timezone ?? DEFAULT_TIMEZONE,
  });
  const [errors, setErrors] = useState<CompanyFormErrors>({});
  const [pending, startTransition] = useTransition();

  // Quem usa CPF não tem data de fundação: o campo só aparece fora desse caso.
  const kind = documentKind(values.document);

  function set(field: keyof CompanyFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  // Ao sair do campo, o documento ganha a máscara do CPF ou do CNPJ.
  function formatDocumentOnBlur() {
    const digits = normalizeDocument(values.document);
    if (digits.length === 11 || digits.length === 14) {
      setValues((current) => ({
        ...current,
        document: formatDocument(digits),
      }));
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateCompanyForm(values);
    setErrors(found);
    const firstInvalid = companyFieldOrder.find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(ids(firstInvalid))?.focus();
      return;
    }

    startTransition(async () => {
      const result = company
        ? await updateCompanyAction(company.id, values)
        : await createCompanyAction(values);

      if (result.ok) {
        toast.success(editing ? "Empresa atualizada." : "Empresa cadastrada.", {
          description: values.corporateReason.trim(),
        });
        onOpenChange(false);
        // O cadastro devolve a empresa nova: a lista abre o do administrador.
        if (result.created) onCreated?.(result.created);
        return;
      }
      if (result.field) {
        setErrors({ [result.field]: result.message });
        document.getElementById(ids(result.field))?.focus();
      }
      toast.error(
        editing
          ? "Não foi possível atualizar a empresa."
          : "Não foi possível cadastrar a empresa.",
        { description: result.message },
      );
    });
  }

  const hint = "text-xs text-muted-foreground";

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {editing ? "Alterar empresa" : "Nova empresa"}
        </DialogTitle>
        <DialogDescription>
          {editing
            ? `Dados cadastrais de ${company.fantasyName ?? company.corporateReason}.`
            : "Dados cadastrais. Depois você cadastra o administrador da empresa."}
        </DialogDescription>
      </DialogHeader>

      <FormField
        id={ids("corporateReason")}
        label="Razão social"
        required
        error={errors.corporateReason}
      >
        <Input
          id={ids("corporateReason")}
          value={values.corporateReason}
          onChange={(event) => set("corporateReason", event.target.value)}
          autoComplete="off"
          aria-invalid={errors.corporateReason ? true : undefined}
          autoFocus
        />
        {kind === "CPF" && (
          <p className={hint}>Para CPF, informe o nome da pessoa.</p>
        )}
      </FormField>

      <FormField
        id={ids("fantasyName")}
        label="Nome fantasia"
        error={errors.fantasyName}
      >
        <Input
          id={ids("fantasyName")}
          value={values.fantasyName}
          onChange={(event) => set("fantasyName", event.target.value)}
          maxLength={MAX_FANTASY_NAME}
          autoComplete="off"
          aria-invalid={errors.fantasyName ? true : undefined}
        />
        <p className={hint}>
          Opcional. Sem ele, o Orari mostra a razão social.
        </p>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={ids("document")}
          label={kind ? kind : "CPF ou CNPJ"}
          required
          error={errors.document}
        >
          <Input
            id={ids("document")}
            value={values.document}
            onChange={(event) =>
              set("document", event.target.value.toUpperCase().slice(0, 18))
            }
            onBlur={formatDocumentOnBlur}
            autoComplete="off"
            inputMode="text"
            aria-invalid={errors.document ? true : undefined}
          />
        </FormField>

        {kind !== "CPF" && (
          <FormField
            id={ids("foundationDate")}
            label="Data de fundação"
            error={errors.foundationDate}
          >
            <DatePicker
              id={ids("foundationDate")}
              name="foundationDate"
              maxDate={new Date()}
              initialValue={values.foundationDate}
              onValueChange={(value) => set("foundationDate", value)}
            />
          </FormField>
        )}
      </div>

      <FormField
        id={ids("subdomain")}
        label="Subdomínio"
        required
        error={errors.subdomain}
      >
        <Input
          id={ids("subdomain")}
          value={values.subdomain}
          onChange={(event) =>
            set("subdomain", event.target.value.toLowerCase().trim())
          }
          autoComplete="off"
          placeholder="Ex.: clinica-sol"
          aria-invalid={errors.subdomain ? true : undefined}
        />
        <p className={hint}>
          Identificador único da empresa: letras minúsculas, números e hífens.
        </p>
      </FormField>

      <FormField
        id={ids("timezone")}
        label="Fuso horário"
        required
        error={errors.timezone}
      >
        <Select
          value={values.timezone}
          onValueChange={(next) => set("timezone", next)}
        >
          <SelectTrigger
            id={ids("timezone")}
            className="w-full"
            aria-invalid={errors.timezone ? true : undefined}
          >
            <SelectValue placeholder="Selecione o fuso" />
          </SelectTrigger>
          <SelectContent>
            {timezoneOptions(company?.timezone).map((zone) => (
              <SelectItem key={zone.value} value={zone.value}>
                {zone.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className={hint}>
          Define em que relógio valem os horários de funcionamento e a agenda.
        </p>
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {editing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {editing
            ? pending
              ? "Salvando…"
              : "Salvar alterações"
            : pending
              ? "Cadastrando…"
              : "Cadastrar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
