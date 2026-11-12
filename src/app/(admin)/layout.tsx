import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-cookie";
import { getCurrentUser } from "@/services/auth.service";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  // Lido no servidor para a sidebar já nascer no estado certo, sem piscar.
  const cookieStore = await cookies();
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  // Buscado uma vez aqui e repassado ao header de todas as telas.
  // Sessão recusada pela API: o apiFetch leva ao login sozinho.
  const user = await getCurrentUser();
  // O profissional (só app) não usa o sistema web: a API já recusa tudo, e aqui
  // ele volta para o app caso uma sessão da clínica tenha escapado.
  if (user.type === "PROFESSIONAL") redirect("/app");

  return (
    <AdminShell defaultCollapsed={collapsed} user={user}>
      {children}
    </AdminShell>
  );
}
