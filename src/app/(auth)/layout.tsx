import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Telas públicas (login e cadastro): sem sidebar e sem header. Formulário à
// esquerda e, em telas largas, o painel da marca à direita. A página tem a
// altura da tela e não rola: só a área do formulário rola (o cadastro é longo).
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex h-dvh gap-4 overflow-hidden bg-background p-3 text-foreground sm:p-4">
      <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card lg:max-w-xl">
        <div className="flex shrink-0 items-center justify-between p-6">
          <Logo variant="full" className="h-10 w-auto" />
          <ThemeToggle />
        </div>
        <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-6">
          {/* my-auto centraliza quando cabe; quando não cabe, começa no topo
              (com items-center no main, o topo do formulário ficaria cortado).
              relative: o input escondido do Checkbox do Radix (aceite dos
              termos) fica preso aqui e não estica a página. */}
          <div className="my-auto flex w-full justify-center py-10">
            {children}
          </div>
        </main>
        <footer className="shrink-0 p-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Orari
        </footer>
      </div>

      <AuthBrandPanel />
    </div>
  );
}
