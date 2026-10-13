import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Telas públicas (login): sem sidebar e sem header. Formulário à esquerda e,
// em telas largas, o painel da marca à direita.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh gap-4 bg-background p-3 text-foreground sm:p-4">
      <div className="flex flex-1 flex-col rounded-card border border-border bg-card lg:max-w-xl">
        <div className="flex items-center justify-between p-6">
          <Logo variant="full" className="h-10 w-auto" />
          <ThemeToggle />
        </div>
        <main className="flex flex-1 items-center justify-center px-6 py-10">
          {children}
        </main>
        <footer className="p-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Orari
        </footer>
      </div>

      <AuthBrandPanel />
    </div>
  );
}
