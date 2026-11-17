"use client";

import { useState } from "react";
import { HandCoins } from "lucide-react";
import { Hint } from "@/components/shared/Hint";
import { CompanyPaymentsDialog } from "@/components/subscription-payments/CompanyPaymentsDialog";
import { Button } from "@/components/ui/button";

/** Botão da linha (Assinaturas) que abre os pagamentos da empresa. */
export function CompanyPaymentsButton({
  company,
}: {
  company: { id: string; name: string };
}) {
  const [open, setOpen] = useState(false);
  const label = `Pagamentos de ${company.name}`;
  return (
    <>
      <Hint label={label}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={() => setOpen(true)}
        >
          <HandCoins aria-hidden="true" />
        </Button>
      </Hint>
      <CompanyPaymentsDialog
        open={open}
        onOpenChange={setOpen}
        company={company}
      />
    </>
  );
}
