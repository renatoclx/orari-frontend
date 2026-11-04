import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppToaster } from "@/components/layout/AppToaster";
import "./globals.css";

// Fonte hospedada no projeto (variável, 200–800, só o subconjunto latin, que
// cobre o português): o next/font/google dependia de baixar do Google no dev e
// no build, e no dev falhava, caindo na fonte do sistema.
const jakarta = localFont({
  src: "./fonts/PlusJakartaSans-latin.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Orari",
  description: "Gestão de agendamentos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={jakarta.variable} suppressHydrationWarning>
      {/* Extensões do navegador (ex.: ColorZilla) injetam atributos no body
          antes da hidratação. */}
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          {/* Dicas (tooltips) de toda a aplicação, inclusive do login. */}
          <TooltipProvider delayDuration={300}>
            {/* Antes do conteúdo: o Toaster precisa estar ativo quando a página
                disparar um toast logo ao abrir (ex.: despedida do logout). */}
            <AppToaster />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
