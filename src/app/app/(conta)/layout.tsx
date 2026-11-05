import { AppBottomNav } from "@/components/client-app/AppBottomNav";

// Telas de quem entrou no app: o conteúdo rola e a barra fica embaixo.
export default function AccountAppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-6 px-4 pt-8 pb-6">
        {children}
      </main>
      <AppBottomNav />
    </div>
  );
}
