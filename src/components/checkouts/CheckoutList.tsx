"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, HandCoins } from "lucide-react";
import { CheckoutDialog } from "@/components/checkouts/CheckoutDialog";
import { Hint } from "@/components/shared/Hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckoutItem } from "@/types/payment";
import type { PaymentMethodItem } from "@/types/payment-method";
import { checkoutState } from "@/utils/checkout";
import { formatPrice } from "@/utils/format";

type CheckoutListProps = {
  checkouts: CheckoutItem[];
  /** Métodos ativos, para a baixa. */
  methods: PaymentMethodItem[];
  /** Termo da busca atual, para a mensagem de lista vazia. */
  search: string;
  timeZone: string;
  /** Hoje no fuso da empresa, "aaaa-mm-dd". */
  today: string;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

// A situação vem de utils/checkout.ts; aqui só vira texto. "Paga" fica só para
// quem de fato pagou: atendimento ainda não concluído não tem cobrança.
function CheckoutBadge({ checkout }: { checkout: CheckoutItem }) {
  switch (checkoutState(checkout)) {
    case "open":
      return <Badge variant="outline">Aberta</Badge>;
    case "paid":
      return <Badge variant="success">Paga</Badge>;
    case "package":
      return <Badge variant="secondary">Incluído no pacote</Badge>;
    case "awaiting":
      return <Badge variant="secondary">Aguardando conclusão</Badge>;
  }
}

// Receber só na comanda aberta; nas demais, Ver (só leitura).
function OpenButton({
  checkout,
  onOpen,
}: {
  checkout: CheckoutItem;
  onOpen: (checkout: CheckoutItem) => void;
}) {
  if (checkoutState(checkout) === "open") {
    return (
      <Button size="sm" onClick={() => onOpen(checkout)}>
        <HandCoins aria-hidden="true" />
        Receber
      </Button>
    );
  }
  return (
    <Hint label={`Ver a comanda de ${checkout.client.name}`}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Ver a comanda de ${checkout.client.name}`}
        onClick={() => onOpen(checkout)}
      >
        <Eye aria-hidden="true" />
      </Button>
    </Hint>
  );
}

const ClientLink = ({ checkout }: { checkout: CheckoutItem }) => (
  <Link
    href={`/clientes/${checkout.client.id}`}
    className="font-medium hover:underline"
  >
    {checkout.client.name}
  </Link>
);

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function CheckoutList({
  checkouts,
  methods,
  search,
  timeZone,
  today,
  footer,
}: CheckoutListProps) {
  // A comanda fica guardada ao fechar, para o dialog não mudar de conteúdo
  // durante a animação de saída. Guarda o cliente: os dados vêm sempre da lista
  // atual, que a baixa recarrega.
  const [openId, setOpenId] = useState<string>();
  const [open, setOpen] = useState(false);
  const current = checkouts.find((item) => item.client.id === openId);

  function show(checkout: CheckoutItem) {
    setOpenId(checkout.client.id);
    setOpen(true);
  }

  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium whitespace-nowrap text-muted-foreground";

  return (
    <div className="flex min-h-[24rem] flex-1 flex-col rounded-card border border-border bg-card md:min-h-0">
      <div className="min-h-0 flex-1 overflow-auto">
        {checkouts.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {search
              ? `Nenhuma comanda encontrada para “${search}”.`
              : "Nenhuma comanda hoje."}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {checkouts.map((checkout) => (
                <li
                  key={checkout.client.id}
                  className="flex items-center justify-between gap-2 p-4"
                >
                  <div className="space-y-1">
                    <p>
                      <ClientLink checkout={checkout} />
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {checkout.appointments.length}{" "}
                      {checkout.appointments.length === 1
                        ? "atendimento"
                        : "atendimentos"}{" "}
                      · hoje {formatPrice(checkout.todayPending)}
                      {Number(checkout.previousPending) > 0 &&
                        ` · pendências ${formatPrice(checkout.previousPending)}`}
                    </p>
                    <CheckoutBadge checkout={checkout} />
                  </div>
                  <OpenButton checkout={checkout} onOpen={show} />
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  {[
                    "Cliente",
                    "Atendimentos",
                    "A receber hoje",
                    "Pendências",
                    "Status",
                    "Ações",
                  ].map((title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {checkouts.map((checkout) => (
                  <tr
                    key={checkout.client.id}
                    className="tabular-nums hover:bg-background"
                  >
                    <td className="px-4 py-3">
                      <ClientLink checkout={checkout} />
                    </td>
                    <td className="px-4 py-3">
                      {checkout.appointments.length}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatPrice(checkout.todayPending)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatPrice(checkout.previousPending)}
                    </td>
                    <td className="px-4 py-3">
                      <CheckoutBadge checkout={checkout} />
                    </td>
                    <td className="px-4 py-2">
                      <OpenButton checkout={checkout} onOpen={show} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <CheckoutDialog
        open={open}
        onOpenChange={setOpen}
        checkout={current}
        methods={methods}
        timeZone={timeZone}
        today={today}
      />
    </div>
  );
}
