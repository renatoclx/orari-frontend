"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import { ProductSaleDialog } from "@/components/product-sales/ProductSaleDialog";
import { Button } from "@/components/ui/button";

/** "Nova venda" nas Comandas: para quem só vem comprar (sem atendimento hoje). */
export function NewSaleButton({ clients }: { clients: ClientOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        Nova venda
      </Button>
      <ProductSaleDialog
        open={open}
        onOpenChange={setOpen}
        initialClients={clients}
      />
    </>
  );
}
