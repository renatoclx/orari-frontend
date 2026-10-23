"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { CompanyFormDialog } from "@/components/companies/CompanyFormDialog";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_PATH = "/empresas";

// Mesmos ids de COMPANY_STATUS_FILTERS (a lista fica no servidor; aqui só o texto).
const STATUS_OPTIONS = [
  { id: "todas", label: "Todas as empresas" },
  { id: "ativas", label: "Ativas" },
  { id: "inativas", label: "Inativas" },
];

type CompaniesToolbarProps = {
  /** Filtro atual de status. */
  status: string;
  currentUserId: string;
};

/**
 * Filtro de status (na URL) e "Nova empresa". Depois de cadastrar, abre o
 * cadastro do administrador da empresa nova (ela ainda não tem quem entre).
 */
export function CompaniesToolbar({
  status,
  currentUserId,
}: CompaniesToolbarProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [adminOf, setAdminOf] = useState<{ id: string; name: string }>();
  const [adminOpen, setAdminOpen] = useState(false);

  function changeStatus(next: string) {
    router.push(next === "todas" ? BASE_PATH : `${BASE_PATH}?status=${next}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={status} onValueChange={changeStatus}>
        <SelectTrigger
          className="w-full sm:w-52"
          aria-label="Filtrar por status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className="w-full sm:ml-auto sm:w-auto"
        onClick={() => setCreating(true)}
      >
        <Plus aria-hidden="true" />
        Nova empresa
      </Button>

      <CompanyFormDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(company) => {
          setAdminOf(company);
          setAdminOpen(true);
        }}
      />

      {/* A empresa guardada fica ao fechar: o dialog não troca de texto na saída. */}
      <UserFormDialog
        open={adminOpen}
        onOpenChange={setAdminOpen}
        typeOptions={["ADMIN"]}
        currentUserId={currentUserId}
        forCompany={
          adminOf
            ? { id: adminOf.id, name: adminOf.name, type: "ADMIN" }
            : undefined
        }
      />
    </div>
  );
}
