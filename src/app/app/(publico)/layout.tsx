import { AppToaster } from "@/components/client-app/AppToaster";
import { Logo } from "@/components/layout/Logo";

// Telas de quem ainda não entrou no app: a marca no topo e o formulário.
export default function PublicAppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex flex-1 flex-col px-4 pt-10 pb-8">
      <Logo variant="full" className="h-9 w-auto self-start" />
      <main className="mt-8 flex flex-1 flex-col">{children}</main>
      <AppToaster />
    </div>
  );
}
