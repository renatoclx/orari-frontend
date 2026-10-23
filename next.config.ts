import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone: só os arquivos que o servidor usa, sem o
  // node_modules inteiro. É o que a imagem Docker copia (ver Dockerfile).
  output: "standalone",
  experimental: {
    serverActions: {
      // O padrão é 1 MB; a foto da pessoa pode ter até 2 MB.
      bodySizeLimit: "3mb",
    },
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
