"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Ban,
  CircleCheck,
  EllipsisVertical,
  Eye,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { setTemplateActiveAction } from "@/app/(admin)/anamnesis-template-actions";
import { TemplateDetails } from "@/components/anamnesis/templates/TemplateDetails";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TemplateItem } from "@/types/anamnesis";

type TemplateListProps = {
  templates: TemplateItem[];
  /** Há busca ou filtro aplicado, para a mensagem de lista vazia. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

type RowHandlers = {
  onView: (template: TemplateItem) => void;
  onDeactivate: (template: TemplateItem) => void;
  onActivate: (template: TemplateItem) => void;
  /** Há uma ativação em andamento. */
  busy: boolean;
};

// Nome com a descrição na segunda linha, menor (decisão do projeto).
function NameCell({ template }: { template: TemplateItem }) {
  return (
    <>
      <span className="font-medium">{template.name}</span>
      {template.description && (
        <span className="block text-xs text-muted-foreground">
          {template.description}
        </span>
      )}
    </>
  );
}

// Coluna Ações (screen-patterns.md): "Alterar" em destaque; as demais no menu
// de três pontos. Modelo não é excluído: só inativado e reativado.
function TemplateActions({
  template,
  onView,
  onDeactivate,
  onActivate,
  busy,
}: { template: TemplateItem } & RowHandlers) {
  return (
    <div className="flex shrink-0 items-center justify-start gap-1">
      <Hint label={`Alterar ${template.name}`}>
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label={`Alterar ${template.name}`}
        >
          <Link href={`/anamnese/modelos/${template.id}/editar`}>
            <Pencil aria-hidden="true" />
          </Link>
        </Button>
      </Hint>

      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Hint label={`Mais ações para ${template.name}`}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Mais ações para ${template.name}`}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </Hint>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(template)}>
            <Eye aria-hidden="true" />
            Visualizar
          </DropdownMenuItem>
          {template.isActive ? (
            <DropdownMenuItem onSelect={() => onDeactivate(template)}>
              <Ban aria-hidden="true" />
              Inativar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={busy}
              onSelect={() => onActivate(template)}
            >
              <CircleCheck aria-hidden="true" />
              Ativar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function TemplateList({
  templates,
  filtered,
  footer,
}: TemplateListProps) {
  const [viewing, setViewing] = useState<TemplateItem | null>(null);
  const [deactivating, setDeactivating] = useState<TemplateItem | null>(null);
  const [pending, startTransition] = useTransition();
  const [activating, startActivate] = useTransition();

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;
    startTransition(async () => {
      const result = await setTemplateActiveAction(target.id, false);
      if (result.ok) {
        toast.success("Modelo inativado.", { description: target.name });
        setDeactivating(null);
      } else {
        toast.error("Não foi possível inativar o modelo.", {
          description: result.message,
        });
      }
    });
  }

  function activate(template: TemplateItem) {
    startActivate(async () => {
      const result = await setTemplateActiveAction(template.id, true);
      if (result.ok) {
        toast.success("Modelo ativado.", { description: template.name });
      } else {
        toast.error("Não foi possível ativar o modelo.", {
          description: result.message,
        });
      }
    });
  }

  const handlers: RowHandlers = {
    onView: setViewing,
    onDeactivate: setDeactivating,
    onActivate: activate,
    busy: activating,
  };
  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {templates.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {filtered
              ? "Nenhum modelo encontrado para a busca ou o filtro."
              : "Nenhum modelo de ficha cadastrado. Cadastre o primeiro!"}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {templates.map((template) => (
                <li key={template.id} className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p>
                      <NameCell template={template} />
                    </p>
                    <TemplateActions template={template} {...handlers} />
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                    <dt className="text-muted-foreground">Perguntas</dt>
                    <dd>{template.currentVersion.questions.length}</dd>
                    <dt className="text-muted-foreground">Versão</dt>
                    <dd>{template.currentVersion.version}</dd>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <StatusBadge active={template.isActive} />
                    </dd>
                  </dl>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  {["Nome", "Perguntas", "Versão", "Status", "Ações"].map(
                    (title) => (
                      <th key={title} scope="col" className={headerClass}>
                        {title}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-background">
                    <td className="px-4 py-3">
                      <NameCell template={template} />
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {template.currentVersion.questions.length}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {template.currentVersion.version}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={template.isActive} />
                    </td>
                    <td className="px-4 py-2">
                      <TemplateActions template={template} {...handlers} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="sm:max-w-xl">
          {viewing && <TemplateDetails template={viewing} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              <X aria-hidden="true" />
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Inativar modelo?"
        description={`O modelo ${deactivating?.name ?? ""} ficará inativo e não poderá abrir novas fichas. As fichas já existentes continuam acessíveis e recebendo acompanhamentos. Você poderá ativá-lo novamente.`}
        confirmLabel="Inativar"
        pendingLabel="Inativando…"
        icon={Ban}
        pending={pending}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
