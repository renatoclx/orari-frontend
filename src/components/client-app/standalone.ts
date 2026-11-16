/**
 * O app está aberto como instalado (ícone da tela de início), e não no
 * navegador? Só no navegador do cliente: lê `window`.
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari do iPhone antigo: a marca própria dele.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
