"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  X,
} from "lucide-react";
import { monthLongLabel } from "@/components/platform-dashboard/platform-format";
import { Hint } from "@/components/shared/Hint";
import { CompanyPaymentsDialog } from "@/components/subscription-payments/CompanyPaymentsDialog";
import { shiftMonth } from "@/components/subscription-payments/payment-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_PATH = "/cobrancas";
const hrefOf = (month: string, current: string) =>
  month === current ? BASE_PATH : `${BASE_PATH}?mes=${month}`;

type Company = { id: string; name: string };

/**
 * Navegação entre os meses (setas e "Mês atual") e "Registrar pagamento", que
 * pede a empresa e abre o formulário já com o período e o valor sugeridos.
 */
export function PaymentsToolbar({
  month,
  current,
  companies,
}: {
  month: string;
  /** Mês atual ("aaaa-mm"): sem ?mes na URL. */
  current: string;
  /** Empresas com assinatura (as únicas que recebem pagamento). */
  companies: Company[];
}) {
  const [picking, setPicking] = useState(false);
  const [chosenId, setChosenId] = useState("");
  const [company, setCompany] = useState<Company>();
  const [formOpen, setFormOpen] = useState(false);
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Hint label="Mês anterior">
          <Button variant="outline" size="icon" asChild>
            <Link href={hrefOf(previous, current)} aria-label="Mês anterior">
              <ChevronLeft aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
        <span className="min-w-36 text-center text-sm font-medium first-letter:uppercase">
          {monthLongLabel(month)}
        </span>
        <Hint label="Mês seguinte">
          <Button variant="outline" size="icon" asChild>
            <Link href={hrefOf(next, current)} aria-label="Mês seguinte">
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
        {month !== current && (
          <Button variant="outline" asChild>
            <Link href={BASE_PATH}>
              <CalendarCheck aria-hidden="true" />
              Mês atual
            </Link>
          </Button>
        )}
      </div>

      <Button
        className="max-sm:w-full"
        onClick={() => {
          setChosenId("");
          setPicking(true);
        }}
        disabled={companies.length === 0}
      >
        <HandCoins aria-hidden="true" />
        Registrar pagamento
      </Button>

      {/* Primeiro a empresa; depois, o formulário dela. */}
      <Dialog open={picking} onOpenChange={setPicking}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
            <DialogDescription>
              De qual empresa é o pagamento?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="payment-company">Empresa</Label>
            <Select value={chosenId} onValueChange={setChosenId}>
              <SelectTrigger id="payment-company" className="w-full">
                <SelectValue placeholder="Escolha a empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPicking(false)}>
              <X aria-hidden="true" />
              Cancelar
            </Button>
            <Button
              disabled={!chosenId}
              onClick={() => {
                setCompany(companies.find((item) => item.id === chosenId));
                setPicking(false);
                setFormOpen(true);
              }}
            >
              <ArrowRight aria-hidden="true" />
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CompanyPaymentsDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        company={company}
        startOnForm
      />
    </div>
  );
}
