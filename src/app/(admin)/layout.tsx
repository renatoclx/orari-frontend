import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-cookie";
import { ApiError } from "@/services/api";
import { getCurrentUser } from "@/services/auth.service";
import type { CurrentUser } from "@/types/auth";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  // Lido no servidor para a sidebar já nascer no estado certo, sem piscar.
  const cookieStore = await cookies();
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  // Buscado uma vez aqui e repassado ao header de todas as telas.
  let user: CurrentUser;
  try {
    user = await getCurrentUser();
  } catch (error) {
    // Provisório até o passo 4.7: sem sessão válida, vai para o login.
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }

  return (
    <AdminShell defaultCollapsed={collapsed} user={user}>
      {children}
    </AdminShell>
  );
}
