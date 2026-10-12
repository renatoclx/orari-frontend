# Arquitetura Frontend

## Stack utilizada

- React
- Next.js App Router
- Tailwind CSS
- TypeScript

## Estrutura

public/ (arquivos estáticos — deve ficar na raiz do projeto)
src/
  app/
  components/
  hooks/
  services/
  types/
  utils/

## Organização

. As páginas não devem conter regras de negócio.
. Toda comunicação com a API deve ocorrer através da camada services.
. Os componentes devem ser reutilizáveis sempre que possível.
