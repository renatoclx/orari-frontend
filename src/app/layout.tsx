import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
      <body>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          {/* Antes do conteúdo: o Toaster precisa estar ativo quando a página
              disparar um toast logo ao abrir (ex.: despedida do logout). */}
          <AppToaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
