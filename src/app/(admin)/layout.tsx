import { cookies } from "next/headers";
import { AdminShell } from "@/components/layout/AdminShell";
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-cookie";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  // Lido no servidor para a sidebar já nascer no estado certo, sem piscar.
  const cookieStore = await cookies();
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  return <AdminShell defaultCollapsed={collapsed}>{children}</AdminShell>;
}
