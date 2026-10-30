import { ArrowLeft, X, type LucideIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  /** Texto do botão de confirmação (ex.: "Excluir"). */
  confirmLabel: string;
  /** Texto do botão enquanto a operação roda (ex.: "Excluindo…"). */
  pendingLabel: string;
  /** A operação está em andamento: bloqueia os botões e o fechamento. */
  pending: boolean;
  /** Ações que apagam algo usam o botão vermelho. */
  destructive?: boolean;
  /** Texto do botão que desiste da ação ("Cancelar" por padrão). */
  cancelLabel?: string;
  /** Ícone do botão de confirmação (ex.: lixeira para "Excluir"). */
  icon: LucideIcon;
  onConfirm: () => void;
  /** Campos entre a descrição e os botões (ex.: o motivo do cancelamento). */
  children?: React.ReactNode;
};

// Diálogo de confirmação padrão (screen-patterns.md): mostra o que vai
// acontecer, permite cancelar e só executa depois da confirmação. Fica aberto
// enquanto a operação roda; quem usa o fecha quando ela termina.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  pending,
  destructive = false,
  cancelLabel = "Cancelar",
  icon: Icon,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !pending && onOpenChange(next)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {cancelLabel === "Voltar" ? (
              <ArrowLeft aria-hidden="true" />
            ) : (
              <X aria-hidden="true" />
            )}
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className={
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90"
                : undefined
            }
            onClick={(event) => {
              // Evita o fechamento automático: o diálogo fica aberto com o
              // texto de andamento até a operação terminar.
              event.preventDefault();
              onConfirm();
            }}
          >
            <Icon aria-hidden="true" />
            {pending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
