"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { CloseCommissionDialog } from "@/components/commissions/CloseCommissionDialog";
import { useCan } from "@/components/layout/Access";
import { Button } from "@/components/ui/button";
import type { PayableCommission } from "@/types/payable";
import { formatPrice } from "@/utils/format";

/**
 * Comissões em aberto (screens/contas-a-pagar.md): linha calculada por
 * profissional, não é conta. Quita-se pelo fechamento, que vira conta paga.
 */
export function OpenCommissions({
  commissions,
  methods,
  today,
}: {
  commissions: PayableCommission[];
  methods: { id: string; name: string }[];
  today: string;
}) {
  const canClose = useCan("commissions", "edit");
  // Um diálogo só, fora das linhas: ao fechar, o profissional sai do bloco
  // (a tela recarrega) e a confirmação com "Imprimir recibo" precisa ficar.
  const [closing, setClosing] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [open, setOpen] = useState(false);

  return (
    <>
      {commissions.length > 0 && (
        <section
          aria-labelledby="open-commissions-title"
          className="rounded-card border border-border bg-card"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border px-4 py-3">
            <h2 id="open-commissions-title" className="font-semibold">
              Comissões em aberto
            </h2>
            <p className="text-sm text-muted-foreground">
              Sem vencimento: o fechamento paga e lança a conta.
            </p>
          </div>
          {/* Muitos profissionais: rola por dentro e não empurra a lista. */}
          <ul className="max-h-52 divide-y divide-border overflow-auto">
            {commissions.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3"
              >
                <span className="min-w-40 flex-1 font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  Comissão {formatPrice(item.commission)} · Adiantado{" "}
                  {formatPrice(item.advanced)}
                </span>
                <span className="tabular-nums">
                  A pagar <strong>{formatPrice(item.toPay)}</strong>
                </span>
                {canClose && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setClosing({ id: item.id, name: item.name });
                      setOpen(true);
                    }}
                  >
                    <CheckCircle2 aria-hidden="true" />
                    Fechar comissão
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {closing && (
        <CloseCommissionDialog
          open={open}
          onOpenChange={setOpen}
          professional={closing}
          methods={methods}
          today={today}
        />
      )}
    </>
  );
}
