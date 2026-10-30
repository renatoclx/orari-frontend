# Ajuda

Os manuais do Orari em PDF, para consulta dentro do sistema. Por enquanto só o
ADMIN acessa: o item "Ajuda" (`CircleHelp`) fica no fim do menu; para os demais
perfis a tela responde 404.

## Manuais (`/ajuda`)

### Colunas

- Manual
- Conteúdo (uma linha sobre o que o manual cobre)
- Ações
  - Visualizar (`Eye`): abre o PDF num diálogo, no visualizador do navegador
    (zoom, busca, impressão), com "Abrir em nova aba" e "Fechar".
  - Baixar (`Download`): salva o arquivo.

### Regras específicas

- Os PDFs ficam em `public/manuais/` e só abrem para quem está logado (o proxy de
  login vale para a pasta). Só eles podem ser exibidos em iframe, e só pelo
  próprio site (`X-Frame-Options: SAMEORIGIN` em `/manuais/`; o resto do site
  continua `DENY`).
- A lista vem de `src/components/help/manuals.ts`: um manual novo é uma linha lá.
  Os PDFs são gerados em `docs/manual-usuario` (README) e copiados para
  `public/manuais/`.
- No celular, cartões no lugar da tabela (`ListCard`).

## Pendências

- Manuais para os outros perfis (pós-MVP).
