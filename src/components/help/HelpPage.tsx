import { notFound } from "next/navigation";
import { ManualList } from "@/components/help/ManualList";
import { MANUALS } from "@/components/help/manuals";
import { getCurrentUser } from "@/services/auth.service";

// Ajuda (screens/ajuda.md): os manuais em PDF. Por enquanto só o ADMIN; os
// demais perfis veem 404.
export async function HelpPage() {
  const currentUser = await getCurrentUser();
  if (currentUser.type !== "ADMIN") notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Ajuda</h1>
        <p className="text-sm text-muted-foreground">
          Manuais do Orari, com o passo a passo de cada parte do sistema.
        </p>
      </div>
      <ManualList manuals={MANUALS} />
    </div>
  );
}
