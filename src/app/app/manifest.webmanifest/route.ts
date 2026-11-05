// Manifesto do app do cliente (screens/app-cliente.md): é o que permite
// instalar no celular. Fica em /app (e não na raiz) para valer só para o app:
// o painel da clínica não vira app instalável.

// Cor da logo do Orari: fundo do splash do Android (montado com esta cor e o ícone).
const BRAND_COLOR = "#00B8DB";

export function GET() {
  const manifest = {
    name: "Orari",
    short_name: "Orari",
    description: "Agende seus horários nos seus estabelecimentos.",
    id: "/app",
    start_url: "/app",
    scope: "/app",
    display: "standalone",
    orientation: "portrait",
    lang: "pt-BR",
    background_color: BRAND_COLOR,
    // Barra do sistema na cor do fundo escuro do app.
    theme_color: "#18181b",
    icons: [
      { src: "/app-assets/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/app-assets/icon-512.png", sizes: "512x512", type: "image/png" },
      // O símbolo fica dentro da área segura: o Android pode recortar em círculo.
      {
        src: "/app-assets/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
