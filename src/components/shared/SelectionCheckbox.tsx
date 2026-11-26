import { cn } from "@/lib/utils";

type SelectionCheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  /** Nome para o leitor de tela (a caixa não tem texto ao lado). */
  "aria-label": string;
};

/**
 * Caixa de seleção das listas (baixa e pagamento em lote, itens da comanda).
 * A caixa tem 16 px, mas o `<label>` em volta dá ~40 px de área de toque; a
 * margem negativa compensa a folga, então o layout não muda. Vale também no
 * computador (só facilita o clique).
 */
export function SelectionCheckbox({
  className,
  ...props
}: SelectionCheckboxProps) {
  return (
    <label className="-m-3 inline-flex shrink-0 cursor-pointer p-3 has-disabled:cursor-not-allowed">
      <input
        type="checkbox"
        className={cn("size-4 accent-primary disabled:opacity-40", className)}
        {...props}
      />
    </label>
  );
}
