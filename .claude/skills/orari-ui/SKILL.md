---
name: orari-ui
description: Identidade visual e padrões de interface do Orari (cores, fonte, arredondamentos, layout, dark mode, toasts e textos da interface). Use sempre que criar ou alterar telas, componentes, estilos ou textos exibidos ao usuário no frontend do Orari.
---

# Orari UI

O Orari é um sistema de agendamentos para barbearias, estética, Pilates e afins — abrangente, sem a cara de um único segmento. Quem usa é o dono e sua equipe, no computador e no celular, gerenciando a agenda entre um atendimento e outro. A sensação deve ser **elegante, direta e confiável**: moderna e minimalista.

Estas decisões já foram tomadas pelo time. Quando outra skill de design (ex.: `frontend-design`) sugerir algo diferente, estas regras prevalecem.

## Princípios

1. **A agenda é a protagonista.** A cor fica para as cores dos serviços e para as ações principais; o resto da interface é neutro.
2. **Direto ao ponto.** Cada tela tem uma ação principal clara. Ações secundárias são discretas; nada entra por enfeite.
3. **Calma, mesmo em dia cheio.** Bordas suaves, espaçamento equilibrado (sem exagero), animação só em resposta a uma ação do usuário.
4. **Textos que orientam.** Ver a seção "Textos da interface".

## Cores

Os tokens seguem os nomes do **shadcn/ui**, com os valores do Orari (definidos em `src/app/globals.css`). Eles já trocam sozinhos entre claro e escuro, então **não use `dark:` para as cores base** — `bg-card` já é branco no claro e zinc-800 no escuro.

| Token                            | Uso                                                         |
| -------------------------------- | ----------------------------------------------------------- |
| `background` / `foreground`      | fundo da página / texto principal                           |
| `card` / `popover`               | cards, header, painéis flutuantes                           |
| `muted-foreground`               | texto secundário, ícones inativos                           |
| `muted` / `accent` / `secondary` | fundos discretos (hover, badges) — **não** são cor de texto |
| `border` / `input`               | bordas e divisórias / borda de campos                       |
| `primary` / `primary-foreground` | ação principal (blue-600, texto branco)                     |
| `destructive`                    | ações destrutivas e erros                                   |
| `ring`                           | foco de teclado (blue-400)                                  |
| `brand`                          | marca: logo, item ativo (cyan) — token próprio do Orari     |

A sidebar é escura nos dois temas e tem tokens próprios: `sidebar` (fundo), `sidebar-foreground`, `sidebar-muted` (próprio do Orari), `sidebar-border` e `sidebar-accent` (item ativo e hover). Dentro dela, use só esses tokens.

- `brand` (cyan) é a cor da marca: logo, item ativo da navegação e destaques pontuais (ex.: linha do "agora"). Não usar como decoração nem como fundo de botão — branco sobre o cyan não tem contraste suficiente.
- `primary` (blue-600) é a ação principal. Uma por tela.
- Foco de teclado é global (`globals.css`): contorno de 1 px no token `ring`, que surge com uma transição curta. **Não adicione classes de foco (`focus-visible:ring-*`, `outline-none`) nos componentes** — ao adicionar um componente do shadcn, remova as dele.
- Não usar valores soltos (`bg-[#...]`) nem cores da paleta do Tailwind para a interface base. Se faltar uma cor, ela vira um token novo no `globals.css`.
- Cores de status e de agendamentos ainda não foram definidas: pergunte antes de inventar.

## Componentes (shadcn/ui)

- Primitivos de interface vêm do **shadcn/ui (base Radix)**, em `src/components/ui/` (arquivos em minúsculas, como o shadcn gera). Antes de criar um botão, campo, switch, popover, gaveta, tooltip etc., use o de `@/components/ui/*`; se não existir, adicione com `npx shadcn@latest add <nome>`.
- Já instalados: `button`, `input`, `label`, `switch`, `avatar`, `sheet`, `tooltip`, `popover`, `calendar`.
- Combine classes com `cn()` (`@/lib/utils`), que resolve conflitos do Tailwind (ex.: `h-8` do componente + `h-14` passado por fora).
- Componentes do Orari que usam primitivos ficam fora de `ui/` (ex.: `@/components/shared/PersonAvatar`).
- Componentes do Radix que recebem funções ou objetos com funções (ex.: `Calendar` com `locale`) precisam ser usados dentro de um Client Component.

## Botões

Use `Button` de `@/components/ui/button`:

- `default`: a ação principal da tela ("Agendar", "Salvar alterações").
- `outline`: alternativas e navegação ("Cancelar", "Hoje", setas).
- `ghost`: ações discretas ("Ver detalhes").
- `destructive`: ações destrutivas ("Excluir").
- `size="icon"` para botões só com ícone (sempre com `aria-label`).
- Login: botão e campos com `h-14 text-base` (56 px, texto 16 px), só nessa tela.

## Tipografia

- Fonte única: Plus Jakarta Sans (já é a fonte padrão da página; não precisa de classe).
- Horários, datas e valores usam `tabular-nums`, para alinharem em coluna.
- Nada de rótulos em CAIXA ALTA.

## Forma

- Arredondamento pela hierarquia, sempre com os tokens:
  - `rounded-control`: botões, campos, selects.
  - `rounded-card`: cards e painéis.
  - `rounded-overlay`: modais, menus, toasts.
- Cards **sem sombra**: separam-se pelo fundo (`bg-card`) e pela borda (`border border-border`).
- Sombra só no que flutua sobre o conteúdo (modais, menus, toasts).

## Layout da área administrativa

- Sidebar escura com a logo colorida no topo (`/logo/logo-full-color.svg` aberta, `/logo/logo-icon-color.svg` recolhida). O botão de recolher é um ícone pequeno ao lado da logo; recolhida, a logo vira o botão de expandir ao passar o mouse.
- Header com atalhos, toggle (switch) de tema claro/escuro e usuário logado.
- Componentes da estrutura ficam em `src/components/layout/`; o estado da sidebar recolhida fica em cookie, lido no servidor.
- Celular: header com botão de menu e ícone da logo; a sidebar abre como gaveta por cima do conteúdo.
- Mobile first: escreva o estilo do celular primeiro e amplie com `md:` / `lg:`.

## Padrão de página

Toda página da área administrativa segue o modelo da tela de Agendamentos (`src/app/(admin)/page.tsx`):

- **A página não rola.** A estrutura ocupa a altura da tela (`h-dvh`) e o `<main>` tem padding igual nos quatro lados (`p-4 md:p-8`). Quem rola é o componente principal da página.
- Raiz da página: `flex min-h-0 flex-1 flex-col gap-4`.
- Ordem: título (`<h1 className="text-2xl font-semibold">`), barra de ferramentas da página (navegação e ação principal) e o componente principal.
- O componente principal ocupa a largura toda e a altura que sobra (`min-h-0 flex-1`), tem rolagem própria (`overflow-auto`) e moldura de card (`rounded-card border border-border bg-card`). Cabeçalhos dentro dele ficam fixos com `sticky top-0`.
- Barras de rolagem já são finas e discretas pelo `globals.css`; não estilize por componente.

## Barra de ações lateral

- Componente único `@/components/layout/ActionBar`, renderizado pelo `AdminShell`: aparece em **todas** as telas administrativas a partir do tablet (`md`). Não adicione barras por página.
- **No celular, a barra some** e os mesmos atalhos aparecem como ícones no header, para não cobrir o conteúdo. Cada atalho é um componente reutilizado nos dois lugares (ex.: `CalendarShortcut` com `placement="bar"` ou `"header"`).
- Fixa na borda direita da tela, centralizada na vertical, com cantos arredondados só à esquerda (`rounded-l-overlay`), sombra e sem borda à direita.
- Guarda atalhos secundários (hoje: calendário). Novos atalhos entram nela como botões de ícone com `aria-label` e `title`.
- Painéis abertos por ela usam o `Popover` do shadcn com `side="left"` e `sideOffset={0}`, colados à barra e flutuando sobre o conteúdo.
- O componente principal não reserva espaço para ela: a barra flutua sobre a borda dele.

## Toasts

- Para o resultado de uma ação ("Agendado", "Cliente salvo"). Erros de formulário ficam no próprio campo, não em toast.
- Tipos: sucesso, erro, aviso e informação, cada um com cor e ícone próprios.
- Posição: canto superior direito no computador; rodapé centralizado no celular.
- Erro fica até ser fechado; os demais somem sozinhos.

## Textos da interface

- Em pt-BR, do ponto de vista de quem usa: "Clientes", não "Pessoas do tipo CLIENT".
- Botões dizem o que fazem: "Agendar", "Salvar alterações" — nunca "Enviar" ou "OK".
- A mesma palavra segue o fluxo todo: botão "Agendar" → toast "Agendado".
- Vocabulário do produto: a tela de horários se chama **Agendamentos** (menu e título), não "Agenda".
- Erros explicam o que aconteceu e como resolver, sem pedir desculpas.
- Tela vazia convida a agir: "Nenhum cliente ainda. Cadastre o primeiro."
- Evite separar informações com "·" (ex.: "Ana · Corte · 09:00"); organize pelo layout.

## Acessibilidade

- HTML semântico: `<header>`, `<nav>`, `<main>`, `<button>` para ações, `<a>` para navegação.
- Todo elemento interativo tem foco visível: use elementos nativos (`button`, `a`, `input`) ou `tabindex`, que já recebem o contorno global.
- Botões só com ícone têm `aria-label`; imagens têm `alt`.
- Respeite `prefers-reduced-motion` (variante `motion-safe:`).
