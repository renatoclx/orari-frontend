import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppToaster } from "@/components/layout/AppToaster";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
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
