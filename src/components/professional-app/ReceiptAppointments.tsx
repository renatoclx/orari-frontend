"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice } from "@/utils/format";
import type { ProfessionalClosingReceipt } from "@/types/professional-app";
import { dateOf } from "./professional-clients";
import { RECEIPT_PREVIEW } from "./professional-commissions";

/**
 * Os atendimentos do recibo (screens/app-profissional.md). O recibo é um
 * documento, então não se divide em páginas: mostra os primeiros e um botão
 * abre os demais. Os totais ficam sempre no topo da tela.
 */
export function ReceiptAppointments({
  items,
  timeZone,
}: {
  items: ProfessionalClosingReceipt["details"]["commissions"];
  timeZone: string;
}) {
  const [all, setAll] = useState(false);
  const visible = all ? items : items.slice(0, RECEIPT_PREVIEW);
  const hidden = items.length - RECEIPT_PREVIEW;

  return (
    <>
      <ul className="space-y-2">
        {visible.map((item, index) => (
          <li
            key={`${item.startAt}-${index}`}
            className="space-y-1 rounded-card border border-border bg-card p-4 text-sm"
          >
            <p className="flex items-start justify-between gap-3">
              <span className="min-w-0 truncate font-semibold">
                {item.client}
              </span>
              <span className="shrink-0 font-semibold">
                {formatPrice(item.amount)}
              </span>
            </p>
            <p className="text-muted-foreground">
              {dateOf(item.startAt, timeZone)} · {item.service} · base{" "}
              {formatPrice(item.base)}
            </p>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setAll((value) => !value)}
          aria-expanded={all}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-control border border-border bg-card text-sm font-medium"
        >
          {all ? (
            <ChevronUp className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4" aria-hidden="true" />
          )}
          {all ? "Mostrar menos" : `Ver todos os atendimentos (+${hidden})`}
        </button>
      )}
    </>
  );
}
