import { TablePagination } from "@/components/shared/TablePagination";
import { UserList } from "@/components/users/UserList";
import { UsersToolbar } from "@/components/users/UsersToolbar";
import { getCurrentUser } from "@/services/auth.service";
import { listUsers } from "@/services/user.service";
import type { UserType } from "@/types/auth";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/usuarios";

type UsersListPageProps = {
  /** searchParams da rota (?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de usuários: renderizada no servidor, com a página pela URL. A API
// não tem busca por nome; a ordem é do mais recente para o mais antigo.
export async function UsersListPage({ searchParams }: UsersListPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const [currentUser, result] = await Promise.all([
    getCurrentUser(),
    listUsers({ page, limit: PAGE_SIZE }),
  ]);

  // Só o SUPER_ADMIN atribui SUPER_ADMIN (o backend também confere).
  const typeOptions: UserType[] =
    currentUser.type === "SUPER_ADMIN"
      ? ["SUPER_ADMIN", "ADMIN", "USER"]
      : ["ADMIN", "USER"];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Usuários</h1>
      <UsersToolbar typeOptions={typeOptions} currentUserId={currentUser.id} />
      <UserList
        users={result.items}
        typeOptions={typeOptions}
        currentUserId={currentUser.id}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
          />
        }
      />
    </div>
  );
}
