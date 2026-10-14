import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // O padrão é 1 MB; a foto da pessoa pode ter até 2 MB.
      bodySizeLimit: "3mb",
    },
  },
  async rewrites() {
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
