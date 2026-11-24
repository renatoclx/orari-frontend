/**
 * Moldura das versões de impressão dos relatórios: sem menu, cabeçalho nem
 * barra de ações (fica fora do layout administrativo). O login continua
 * exigido pelo proxy, como em toda rota.
 */
export default function PrintLayout({ children }: LayoutProps<"/">) {
  return (
    // Na tela, a largura útil de uma folha A4 (com as margens do navegador):
    // os gráficos medem a largura ao desenhar e não se refazem ao imprimir.
    <main className="mx-auto flex max-w-[42.5rem] flex-col gap-4 bg-background p-6 text-foreground print:bg-transparent print:p-0">
      {children}
    </main>
  );
}
