# Ajuda

Os manuais do Orari em PDF, para consulta dentro do sistema. O item "Ajuda"
(`CircleHelp`) fica no fim do menu do ADMIN (os manuais da clínica) e do
SUPER_ADMIN (só o **Manual da plataforma**: Painel, empresas e acessos,
assinaturas, cobranças e o cadastro sozinho). Para os demais perfis, 404.

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
- A lista vem de `src/components/help/manuals.ts` (`MANUALS` do ADMIN, `PLATFORM_MANUALS` do SUPER_ADMIN): um manual novo é uma linha lá.
  Os PDFs são gerados em `docs/manual-usuario` (README) e copiados para
  `public/manuais/`.
- No celular, cartões no lugar da tabela (`ListCard`).

## Pendências

- Manuais para os outros perfis (pós-MVP).
