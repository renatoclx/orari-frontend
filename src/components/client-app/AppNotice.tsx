"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Confirmação que a página recebe pela URL (ex.: `?agendado=1`): aparece no
 * toaster do rodapé, em vez de um bloco que empurra o conteúdo, e o parâmetro
 * sai da URL para recarregar a página não repetir o aviso.
 */
export function AppNotice({
  param,
  message,
}: {
  /** O parâmetro da URL que trouxe o aviso. */
  param: string;
  message: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // Só uma vez por montagem (o modo estrito do React roda o efeito duas vezes).
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast.info(message);
    const next = new URLSearchParams(params.toString());
    next.delete(param);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [message, param, params, pathname, router]);

  return null;
}
