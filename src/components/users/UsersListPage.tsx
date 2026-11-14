import { TablePagination } from "@/components/shared/TablePagination";
import { UserList } from "@/components/users/UserList";
import { UsersToolbar } from "@/components/users/UsersToolbar";
import { getCurrentUser } from "@/services/auth.service";
import { listPeople } from "@/services/people.service";
import { listUsers } from "@/services/user.service";
import { canAccess } from "@/utils/access";
import type { UserType } from "@/types/auth";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/usuarios";
// Pessoas para o vínculo (profissionais e funcionários): uma página só cada (clínicas têm poucas).
const LINK_LIMIT = 100;

type UsersListPageProps = {
  /** searchParams da rota (?q= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de usuários: renderizada no servidor, com a busca por nome e a
// página pela URL; a ordem é do mais recente para o mais antigo.
export async function UsersListPage({ searchParams }: UsersListPageProps) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Math.max(1, Number(searchParams.page) || 1);
  // Cacheado na requisição: o layout já o buscou.
  const currentUser = await getCurrentUser();
  // As pessoas do vínculo só são buscadas se a empresa tem a funcionalidade: a API
  // recusa (403) quem não tem, e a tela inteira cairia (ex.: empresa sem Funcionários).
  const linkable = (type: "PROFESSIONAL" | "EMPLOYEE", feature: string) =>
    canAccess(currentUser.access, feature)
      ? listPeople({ type, isActive: true, page: 1, limit: LINK_LIMIT })
      : Promise.resolve({ items: [] });
  const [result, professionals, employees] = await Promise.all([
    listUsers({ page, limit: PAGE_SIZE, name: search || undefined }),
    linkable("PROFESSIONAL", "professionals"),
    linkable("EMPLOYEE", "employees"),
  ]);
  const toOption = ({ id, name }: { id: string; name: string }) => ({
    id,
    name,
  });
  const linkOptions = {
    PROFESSIONAL: professionals.items.map(toOption),
    EMPLOYEE: employees.items.map(toOption),
  };

  // Só o SUPER_ADMIN atribui SUPER_ADMIN (o backend também confere).
  const typeOptions: UserType[] =
    currentUser.type === "SUPER_ADMIN"
      ? ["SUPER_ADMIN", "ADMIN", "USER", "PROFESSIONAL"]
      : ["ADMIN", "USER", "PROFESSIONAL"];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Usuários</h1>
      <UsersToolbar
        search={search}
        typeOptions={typeOptions}
        currentUserId={currentUser.id}
        linkOptions={linkOptions}
      />
      <UserList
        users={result.items}
        search={search}
        typeOptions={typeOptions}
        currentUserId={currentUser.id}
        linkOptions={linkOptions}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={{ q: search || undefined }}
          />
        }
      />
    </div>
  );
}
