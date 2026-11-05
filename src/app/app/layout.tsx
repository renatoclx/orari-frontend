import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Orari", template: "%s | Orari" },
  description: "Agende seus horários nos seus estabelecimentos.",
};

// Barra do navegador do celular na cor do fundo escuro do app.
export const viewport: Viewport = { themeColor: "#18181b" };

/**
 * App do cliente (screens/app-cliente.md): sempre escuro, como o AppBarber,
 * independente do tema da clínica. A classe `dark` aqui troca os tokens de cor
 * só dentro do app. No computador, a tela fica numa coluna de celular.
 */
export default function ClientAppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="dark min-h-dvh bg-background text-foreground [color-scheme:dark]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        {children}
      </div>
    </div>
  );
}
