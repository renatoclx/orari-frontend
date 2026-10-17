"use client";

import Image from "next/image";
import { useState } from "react";

type CompanyLogoProps = {
  name: string;
  /** Caminho da logo (servido pela API em /uploads); sem logo, nada aparece. */
  logoUrl: string | null;
};

// Logo da empresa no header. `unoptimized`: o arquivo vem da API e já é
// pequeno. Se não carregar (endereço inválido), some em vez de mostrar o ícone
// de imagem quebrada.
export function CompanyLogo({ name, logoUrl }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  if (!logoUrl || failed) return null;

  return (
    <Image
      src={logoUrl}
      alt={`Logo de ${name}`}
      width={120}
      height={40}
      unoptimized
      onError={() => setFailed(true)}
      className="h-8 w-auto max-w-32 object-contain"
    />
  );
}
