import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AppSplash } from "@/components/client-app/AppSplash";
import { InstallPromptListener } from "@/components/client-app/install-prompt-store";

// O app usa a Inter (o sistema da clínica segue com a Jakarta). Hospedada no
// projeto, variável e só o subconjunto latin, como a fonte do sistema.
const inter = localFont({
  src: "../fonts/Inter-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: { default: "Orari", template: "%s | Orari" },
  description: "Agende seus horários nos seus estabelecimentos.",
  // Instalar no celular: o manifesto só do app e, no iPhone, as marcas próprias dele.
  manifest: "/app/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Orari",
    // O app desenha por baixo da barra de status (ver o padding de cima).
    statusBarStyle: "black-translucent",
  },
  icons: { apple: "/app-assets/apple-touch-icon.png" },
};

// Barra do navegador na cor do fundo escuro do app; `cover` usa a tela toda
// (o padding com env(safe-area-inset-*) evita o entalhe da câmera).
export const viewport: Viewport = {
  themeColor: "#18181b",
  viewportFit: "cover",
};

/**
 * App do cliente (screens/app-cliente.md): sempre escuro, como o AppBarber,
 * independente do tema da clínica. A classe `dark` aqui troca os tokens de cor
 * só dentro do app. No computador, a tela fica numa coluna de celular.
 */
export default function ClientAppLayout({ children }: LayoutProps<"/app">) {
  return (
    // A cor de destaque do app é a da logo (ciano), no lugar do azul da
    // clínica. Texto escuro sobre o ciano: o branco ficaria sem contraste
    // (2,4:1); o escuro dá 6,1:1, e o ciano sobre o fundo escuro, 7,5:1.
    // A fonte vai direto pela variável da Inter: o `@theme inline` grava a
    // Jakarta na classe `font-sans`, então trocar `--font-sans` não teria efeito.
    <div
      className={`${inter.variable} dark min-h-dvh bg-background pt-[env(safe-area-inset-top)] font-(family-name:--font-inter) text-foreground [color-scheme:dark] [--primary-foreground:#052e36] [--primary:#00b8db] [--ring:#00b8db]`}
    >
      <AppSplash />
      {/* Guarda o evento de instalar do Android assim que o app abre. */}
      <InstallPromptListener />
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        {children}
      </div>
    </div>
  );
}
