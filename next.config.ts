import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// Política de conteúdo (CSP) de base: só o próprio endereço, sem plugins, sem
// ser embutido em outro site. 'unsafe-inline' fica porque o Next, o tema e o
// Radix injetam scripts e estilos em linha; trocar por nonce é a evolução
// (guia "Content Security Policy" do Next, via proxy). Em desenvolvimento o
// React usa eval e o HMR usa WebSocket.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  // blob:/data: = pré-visualização da foto e logo; as fotos do servidor vêm do
  // mesmo endereço (reescrita de /uploads).
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isProduction ? "" : " ws: wss:"}`,
  "media-src 'self' blob:",
  // blob: = o PDF da ficha, mostrado num iframe dentro do diálogo.
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // A câmera é do próprio site (foto do cliente no celular); o resto, desligado.
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    // Em produção a CSP bloqueia; em desenvolvimento só avisa no console
    // (Report-Only), para uma violação nova aparecer sem quebrar a tela.
    key: isProduction
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only",
    value: contentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  // Gera .next/standalone: só os arquivos que o servidor usa, sem o
  // node_modules inteiro. É o que a imagem Docker copia (ver Dockerfile).
  output: "standalone",
  // Não anuncia "X-Powered-By: Next.js" (informação a menos para quem procura versões).
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // O padrão é 1 MB; a foto da pessoa pode ter até 2 MB.
      bodySizeLimit: "3mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    // Lido na construção (`next build`) e gravado no resultado: mudar a API_URL
    // depois, só em tempo de execução, não muda o destino de /uploads.
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return [];

    // As fotos são servidas pelo backend em /uploads (público). O navegador as
    // busca neste mesmo endereço, sem conhecer o endereço da API.
    return [
      { source: "/uploads/:path*", destination: `${apiUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
