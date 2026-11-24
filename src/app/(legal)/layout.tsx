import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Textos legais (termos e privacidade): públicos, sem sidebar, largura de leitura.
export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4 md:px-8">
        <Link href="/cadastro" aria-label="Voltar ao cadastro do Orari">
          <Logo variant="full" className="h-8 w-auto" />
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">{children}</main>
    </div>
  );
}
