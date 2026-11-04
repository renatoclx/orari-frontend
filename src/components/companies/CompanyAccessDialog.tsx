"use client";

import { useEffect, useState, useTransition } from "react";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { AccessLimits } from "@/components/companies/AccessLimits";
import { AccessMatrix } from "@/components/companies/AccessMatrix";
import {
  ACCESS_TEMPLATES,
  applyTemplate,
  parseLimit,
  validateLimits,
  type LimitErrors,
  type LimitValues,
} from "@/components/companies/company-access";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCompanyAccessAction,
  saveCompanyAccessAction,
} from "@/app/(admin)/company-access-actions";
import type {
  AccessMatrix as Matrix,
  CompanyUsage,
} from "@/types/company-access";

type CompanyAccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Guardada pela lista ao fechar, para o título não mudar na animação. */
  company?: { id: string; name: string };
};

/**
 * Acessos e limites da empresa, só para o SUPER_ADMIN (screens/empresas.md).
 * Busca ao abrir; a API valida a matriz ao salvar.
 */
export function CompanyAccessDialog({
  open,
  onOpenChange,
  company,
}: CompanyAccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {/* A chave refaz a busca a cada empresa; fechado, nada é montado. */}
        {company && (
          <AccessForm
            key={company.id}
            company={company}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type Loaded = {
  matrix: Matrix;
  limits: LimitValues;
  usage: CompanyUsage;
};

function AccessForm({
  company,
  onClose,
}: {
  company: { id: string; name: string };
  onClose: () => void;
}) {
  const [state, setState] = useState<Loaded>();
  const [loadError, setLoadError] = useState<string>();
  // Muda para buscar de novo ("Tentar de novo").
  const [attempt, setAttempt] = useState(0);
  const [errors, setErrors] = useState<LimitErrors>({});
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let current = true;
    getCompanyAccessAction(company.id).then((result) => {
      if (!current) return;
      if (!result.ok) {
        setLoadError(result.message);
        return;
      }
      setLoadError(undefined);
      setState({
        matrix: result.access.matrix,
        limits: {
          professionals: String(result.access.limits.professionals),
          admins: String(result.access.limits.admins),
        },
        usage: result.usage,
      });
    });
    return () => {
      current = false;
    };
  }, [company.id, attempt]);

  function applyPlanTemplate(key: string) {
    const template = ACCESS_TEMPLATES.find((item) => item.key === key);
    if (!template || !state) return;
    const next = applyTemplate(template, {
      matrix: state.matrix,
      limits: {
        professionals: parseLimit(state.limits.professionals) ?? 1,
        admins: parseLimit(state.limits.admins) ?? 1,
      },
    });
    setErrors({});
    setState({
      ...state,
      matrix: next.matrix,
      limits: {
        professionals: String(next.limits.professionals),
        admins: String(next.limits.admins),
      },
    });
  }

  function handleSave() {
    if (!state) return;
    const found = validateLimits(state.limits);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    startTransition(async () => {
      const result = await saveCompanyAccessAction(
        company.id,
        state.matrix,
        state.limits,
      );
      if (!result.ok) {
        // Ex.: 400 por dependência entre funcionalidades; o diálogo continua aberto.
        toast.error("Não foi possível salvar.", {
          description: result.message,
        });
        return;
      }
      toast.success("Acessos e limites salvos.", { description: company.name });
      onClose();
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Acessos e limites</DialogTitle>
        <DialogDescription>
          {company.name}: o que os administradores da empresa enxergam e quantos
          profissionais ela pode ter.
        </DialogDescription>
      </DialogHeader>

      {loadError ? (
        <div role="alert" className="space-y-3 py-6 text-center text-sm">
          <p className="text-destructive">{loadError}</p>
          <Button
            variant="outline"
            onClick={() => {
              setLoadError(undefined);
              setAttempt((value) => value + 1);
            }}
          >
            Tentar de novo
          </Button>
        </div>
      ) : !state ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Buscando…
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Modelo de plano
            </span>
            {/* Valor sempre vazio: escolher um modelo só preenche a tela. */}
            <Select value="" onValueChange={applyPlanTemplate}>
              <SelectTrigger
                className="w-48"
                aria-label="Aplicar modelo de plano"
              >
                <SelectValue placeholder="Aplicar modelo…" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_TEMPLATES.map((template) => (
                  <SelectItem key={template.key} value={template.key}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-medium">Funcionalidades</h3>
            <AccessMatrix
              value={state.matrix}
              onChange={(matrix) => setState({ ...state, matrix })}
            />
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium">Limites</h3>
            <AccessLimits
              values={state.limits}
              errors={errors}
              usage={state.usage}
              onChange={(field, value) => {
                setState({
                  ...state,
                  limits: { ...state.limits, [field]: value },
                });
                setErrors((current) => ({ ...current, [field]: undefined }));
              }}
            />
          </section>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!state || pending}>
          <Save aria-hidden="true" />
          {pending ? "Salvando…" : "Salvar"}
        </Button>
      </DialogFooter>
    </>
  );
}
