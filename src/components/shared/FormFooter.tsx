type FormFooterProps = {
  /** Texto à esquerda do rodapé (ex.: legenda dos campos obrigatórios). */
  note?: React.ReactNode;
  children: React.ReactNode;
};

// Rodapé padrão de formulário (screen-patterns.md): botões que persistem os
// dados, separados por uma borda no topo e alinhados à direita. Fica dentro do
// card do formulário. No celular, os botões dividem a linha em partes iguais
// (a legenda fica de fora); se algum não couber, o flex-wrap os empilha.
export function FormFooter({ note, children }: FormFooterProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-3 border-t border-border px-4 py-3 md:px-6 max-sm:[&>:not(p)]:flex-1">
      {/* No celular a legenda ocupa a própria linha; os botões ficam juntos. */}
      {note && (
        <p className="w-full text-sm text-muted-foreground sm:mr-auto sm:w-auto">
          {note}
        </p>
      )}
      {children}
    </div>
  );
}
