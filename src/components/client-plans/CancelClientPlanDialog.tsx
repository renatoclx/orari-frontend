import { Ban } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { ClientPlanItem } from "@/types/client-plan";

type CancelClientPlanDialogProps = {
  /** Contratação a cancelar; nula = fechado. */
  item: ClientPlanItem | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

// Confirmação do cancelamento, com o efeito de cada modalidade
// (business-rules.md, "Cancelamento da contratação").
export function CancelClientPlanDialog({
  item,
  pending,
  onOpenChange,
  onConfirm,
}: CancelClientPlanDialogProps) {
  return (
    <ConfirmDialog
      open={item !== null}
      onOpenChange={onOpenChange}
      title="Cancelar contratação?"
      description={
        item && (
          <span className="block space-y-2">
            <span className="block">
              A contratação de {item.client.name} ({item.plan.name}) será
              cancelada. As agendas são encerradas e as sessões futuras são
              canceladas, liberando os horários.
            </span>
            <span className="block">
              {item.billingType === "MONTHLY"
                ? "As parcelas pendentes que vencem a partir de hoje são canceladas; as atrasadas continuam pendentes e as pagas não mudam."
                : "O pagamento integral não muda."}{" "}
              Não há multa nem reembolso.
            </span>
          </span>
        )
      }
      confirmLabel="Cancelar contratação"
      pendingLabel="Cancelando…"
      cancelLabel="Voltar"
      icon={Ban}
      pending={pending}
      destructive
      onConfirm={onConfirm}
    />
  );
}
