# Padrões para codificação — Frontend

Complementa o `coding-standards.md` do backend com regras pontuais do frontend.

## Nomenclatura

- Código (variáveis, funções, componentes, arquivos) em inglês.
- Textos exibidos na interface em pt-BR.

# Exemplos

- Componentes em PascalCase: `PersonForm.tsx`
  - Exceção: `src/components/ui/` mantém os nomes em minúsculas gerados pelo shadcn/ui (`button.tsx`), para que `npx shadcn add` continue atualizando os arquivos.
- Hooks iniciados com `use`: `useAppointments.ts`
- Services com sufixo `.service.ts`: `people.service.ts`
- Tipos em `src/types/`: `people.ts`

## Imports

- Utilizar sempre o alias `@/` (ex.: `@/components/people/PersonForm`).
- Evitar caminhos relativos como `../../`.

## Tipagem

- TypeScript em Strict Mode.
- Evitar o uso de any;
- Preferir unknown;
- Os tipos devem espelhar as respostas da API (Swagger do backend em `/docs`).

## Componentes

- Server Component por padrão.
- Utilizar `"use client"` apenas quando houver estado, eventos ou APIs do navegador.
- Quando necessário, aplicar `"use client"` no menor componente possível.

## Estilo

- Utilizar apenas Tailwind CSS.
- Cores, fontes e espaçamentos centralizados no `globals.css` (`@theme`).
- Evitar valores soltos repetidos (ex.: `bg-[#1a2b3c]` em vários lugares).

## Datas e valores

- A API trabalha com horários em UTC; a interface exibe no fuso `America/Sao_Paulo`.
- Valores monetários formatados em BRL utilizando `Intl.NumberFormat`.

## Formatação

- Prettier com `prettier-plugin-tailwindcss` (ordena as classes automaticamente).
- Executar `npm run format` antes de commitar.

## Comentários

- Mesma regra do backend: comentar somente quando necessário, explicando o motivo da implementação, e não o que o código faz.
