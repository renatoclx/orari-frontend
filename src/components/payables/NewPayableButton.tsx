"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Can } from "@/components/layout/Access";
import {
  PayableFormDialog,
  type PayeeOption,
} from "@/components/payables/PayableFormDialog";
import { Button } from "@/components/ui/button";
import type { PaymentMethodItem } from "@/types/payment-method";

/** Ação principal do Contas a pagar; some sem a ação "Cria". */
export function NewPayableButton(props: {
  payees: PayeeOption[];
  categories: { id: string; name: string }[];
  methods: PaymentMethodItem[];
  today: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Can feature="payables" action="create">
      <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        Nova conta a pagar
      </Button>
      <PayableFormDialog open={open} onOpenChange={setOpen} {...props} />
    </Can>
  );
}
