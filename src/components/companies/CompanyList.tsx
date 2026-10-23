"use client";

import { useState, useTransition } from "react";
import {
  Ban,
  EllipsisVertical,
  Eye,
  Pencil,
  RotateCcw,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { setCompanyActiveAction } from "@/app/(admin)/company-admin-actions";
import { CompanyFormDialog } from "@/components/companies/CompanyFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Hint } from "@/components/shared/Hint";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import type { Company } from "@/types/company";
import { documentLabel, formatDateOnly, formatDocument } from "@/utils/format";

type CompanyListProps = {
  companies: Company[];
  /** Empresa de quem está logado: não pode ser inativada (a API recusa). */
  ownCompanyId: string;
  currentUserId: string;
  /** Há filtro de status: muda a mensagem de lista vazia. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

type RowHandlers = {
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onAdmin: (company: Company) => void;
  onDeactivate: (company: Company) => void;
  onRestore: (company: Company) => void;
  /** Há uma reativação em andamento. */
  busy: boolean;
  ownCompanyId: string;
};

// Nome na tela: o fantasia, quando existe; senão, a razão social.
const displayName = (company: Company) =>
  company.fantasyName ?? company.corporateReason;

// Coluna Ações (screen-patterns.md): cadastrar o administrador da empresa e
// "Alterar" à vista, só com ícone; as demais no menu de três pontos. Inativa só tem Visualizar
// e Reativar. A própria empresa não tem "Inativar".
function CompanyActions({
  company,
  onView,
  onEdit,
  onAdmin,
  onDeactivate,
  onRestore,
  busy,
  ownCompanyId,
}: { company: Company } & RowHandlers) {
  const name = displayName(company);
  return (
    <div className="flex shrink-0 items-center gap-1">
      {company.isActive && (
        <Hint label={`Cadastrar o administrador de ${name}`}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Cadastrar administrador de ${name}`}
            onClick={() => onAdmin(company)}
          >
            <UserPlus aria-hidden="true" />
          </Button>
        </Hint>
      )}
      <Hint label={company.isActive ? `Alterar ${name}` : "Empresa inativa"}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Alterar ${name}`}
          disabled={!company.isActive}
          onClick={() => onEdit(company)}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </Hint>

      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Hint label={`Mais ações para ${name}`}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Mais ações para ${name}`}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </Hint>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(company)}>
            <Eye aria-hidden="true" />
            Visualizar
          </DropdownMenuItem>
          {company.isActive && company.id !== ownCompanyId && (
            <DropdownMenuItem onSelect={() => onDeactivate(company)}>
              <Ban aria-hidden="true" />
              Inativar
            </DropdownMenuItem>
          )}
          {!company.isActive && (
            <DropdownMenuItem
              disabled={busy}
              onSelect={() => onRestore(company)}
            >
              <RotateCcw aria-hidden="true" />
              Reativar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function CompanyList({
  companies,
  ownCompanyId,
  currentUserId,
  filtered,
  footer,
}: CompanyListProps) {
  // A empresa fica guardada ao fechar, para o dialog não trocar de título
  // durante a animação de saída.
  const [editing, setEditing] = useState<Company>();
  const [editOpen, setEditOpen] = useState(false);
  const [adminOf, setAdminOf] = useState<Company>();
  const [adminOpen, setAdminOpen] = useState(false);
  const [viewing, setViewing] = useState<Company | null>(null);
  const [deactivating, setDeactivating] = useState<Company | null>(null);
  const [pending, startTransition] = useTransition();
  const [restoring, startRestore] = useTransition();

  function restore(company: Company) {
    startRestore(async () => {
      const result = await setCompanyActiveAction(company.id, true);
      if (result.ok) {
        toast.success("Empresa reativada.", {
          description: displayName(company),
        });
      } else {
        toast.error("Não foi possível reativar a empresa.", {
          description: result.message,
        });
      }
    });
  }

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;
    startTransition(async () => {
      const result = await setCompanyActiveAction(target.id, false);
      if (result.ok) {
        toast.success("Empresa inativada.", {
          description: displayName(target),
        });
        setDeactivating(null);
      } else {
        toast.error("Não foi possível inativar a empresa.", {
          description: result.message,
        });
      }
    });
  }

  const handlers: RowHandlers = {
    onView: setViewing,
    onEdit: (company) => {
      setEditing(company);
      setEditOpen(true);
    },
    onAdmin: (company) => {
      setAdminOf(company);
      setAdminOpen(true);
    },
    onDeactivate: setDeactivating,
    onRestore: restore,
    busy: restoring,
    ownCompanyId,
  };
  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium whitespace-nowrap text-muted-foreground";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {companies.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {filtered
              ? "Nenhuma empresa com este status."
              : "Nenhuma empresa cadastrada. Cadastre a primeira!"}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {companies.map((company) => (
                <li key={company.id} className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {company.corporateReason}
                      {company.id === ownCompanyId && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (sua empresa)
                        </span>
                      )}
                    </p>
                    <CompanyActions company={company} {...handlers} />
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                    <dt className="text-muted-foreground">Nome fantasia</dt>
                    <dd>
                      <EmptyValue>{company.fantasyName}</EmptyValue>
                    </dd>
                    <dt className="text-muted-foreground">
                      {documentLabel(company.document)}
                    </dt>
                    <dd className="tabular-nums">
                      {formatDocument(company.document)}
                    </dd>
                    <dt className="text-muted-foreground">Subdomínio</dt>
                    <dd>{company.subdomain}</dd>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <StatusBadge active={company.isActive} />
                    </dd>
                  </dl>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  {[
                    "Razão social",
                    "Nome fantasia",
                    "Documento",
                    "Subdomínio",
                    "Status",
                    "Ações",
                  ].map((title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-background">
                    <td className="px-4 py-3 font-medium">
                      {company.corporateReason}
                      {company.id === ownCompanyId && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (sua empresa)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EmptyValue>{company.fantasyName}</EmptyValue>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {formatDocument(company.document)}
                    </td>
                    <td className="px-4 py-3">{company.subdomain}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={company.isActive} />
                    </td>
                    <td className="px-4 py-2">
                      <CompanyActions company={company} {...handlers} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <CompanyFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        company={editing}
      />

      <UserFormDialog
        open={adminOpen}
        onOpenChange={setAdminOpen}
        typeOptions={["ADMIN"]}
        currentUserId={currentUserId}
        forCompany={
          adminOf
            ? { id: adminOf.id, name: displayName(adminOf), type: "ADMIN" }
            : undefined
        }
      />

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{displayName(viewing)}</DialogTitle>
                <DialogDescription>Dados da empresa.</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Razão social</dt>
                <dd>{viewing.corporateReason}</dd>
                <dt className="text-muted-foreground">Nome fantasia</dt>
                <dd>
                  <EmptyValue>{viewing.fantasyName}</EmptyValue>
                </dd>
                <dt className="text-muted-foreground">
                  {documentLabel(viewing.document)}
                </dt>
                <dd className="tabular-nums">
                  {formatDocument(viewing.document)}
                </dd>
                {viewing.foundationDate && (
                  <>
                    <dt className="text-muted-foreground">Data de fundação</dt>
                    <dd>{formatDateOnly(viewing.foundationDate)}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Subdomínio</dt>
                <dd>{viewing.subdomain}</dd>
                <dt className="text-muted-foreground">Fuso horário</dt>
                <dd>{viewing.timezone}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge active={viewing.isActive} />
                </dd>
              </dl>
            </>
          )}
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
        title="Inativar empresa?"
        description={`${deactivating ? displayName(deactivating) : ""} e todos os usuários dela perdem o acesso ao Orari até a reativação. Os dados são mantidos.`}
        confirmLabel="Inativar"
        pendingLabel="Inativando…"
        icon={Ban}
        pending={pending}
        destructive
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
