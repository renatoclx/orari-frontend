import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // O padrão é 1 MB; a foto da pessoa pode ter até 2 MB.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
