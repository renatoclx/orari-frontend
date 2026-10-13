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

Use apenas os tokens abaixo (definidos em `src/app/globals.css`). Eles já trocam sozinhos entre claro e escuro, então **não use `dark:` para as cores base** — `bg-surface` já é branco no claro e zinc-800 no escuro.

| Token        | Uso                                    |
| ------------ | -------------------------------------- |
| `background` | fundo da página                        |
| `surface`    | cards, header, modais                  |
| `foreground` | texto principal                        |
| `muted`      | texto secundário, ícones inativos      |
| `border`     | bordas e divisórias (sempre discretas) |
| `brand`      | marca: logo, item ativo, foco          |
| `primary`    | botão da ação principal (texto branco) |
| `danger`     | ações destrutivas (texto branco)       |

A sidebar é escura nos dois temas e tem tokens próprios: `sidebar` (fundo), `sidebar-foreground`, `sidebar-muted`, `sidebar-border` e `sidebar-accent` (item ativo e hover). Dentro dela, use só esses tokens, nunca `surface`/`muted`.

- `brand` (cyan) é a cor da marca: logo, item ativo da navegação, foco e destaques pontuais (ex.: linha do "agora"). Não usar como decoração nem como fundo de botão — branco sobre o cyan não tem contraste suficiente.
- `primary` (blue-600) é o fundo do botão da ação principal, com texto `text-primary-foreground` (branco). Uma ação principal por tela.
- Não usar valores soltos (`bg-[#...]`) nem cores da paleta do Tailwind para a interface base. Se faltar uma cor, ela vira um token novo no `globals.css`.
- Cores de status e de agendamentos ainda não foram definidas: pergunte antes de inventar.

## Botões

Use sempre o componente `Button` de `@/components/ui/Button`:

- `primary`: a ação principal da tela ("Agendar", "Salvar alterações").
- `secondary` (padrão): alternativas ("Cancelar", "Voltar").
- `ghost`: ações discretas ("Ver detalhes").
- `danger`: ações destrutivas ("Excluir").
- Desabilitado com o atributo `disabled`, em qualquer variante.

## Tipografia

- Fonte única: Plus Jakarta Sans (já é a fonte padrão da página; não precisa de classe).
- Horários, datas e valores usam `tabular-nums`, para alinharem em coluna.
- Nada de rótulos em CAIXA ALTA.

## Forma

- Arredondamento pela hierarquia, sempre com os tokens:
  - `rounded-control`: botões, campos, selects.
  - `rounded-card`: cards e painéis.
  - `rounded-overlay`: modais, menus, toasts.
- Cards **sem sombra**: separam-se pelo fundo (`bg-surface`) e pela borda (`border border-border`).
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
- O componente principal ocupa a largura toda e a altura que sobra (`min-h-0 flex-1`), tem rolagem própria (`overflow-auto`) e moldura de card (`rounded-card border border-border bg-surface`). Cabeçalhos dentro dele ficam fixos com `sticky top-0`.
- Barras de rolagem já são finas e discretas pelo `globals.css`; não estilize por componente.

## Barra de ações lateral

- Fixa na borda direita da tela, centralizada na vertical (`fixed top-1/2 right-0 -translate-y-1/2`), com cantos arredondados só à esquerda (`rounded-l-overlay`), sombra e sem borda à direita.
- Guarda atalhos secundários da página (hoje: calendário em Agendamentos). Novos atalhos entram nela como botões de ícone com `aria-label` e `title`.
- Painéis abertos por ela (ex.: calendário) usam a Popover API (`popover="auto"` + `popoverTarget`), ficam colados à barra (`right-12`) e flutuam sobre o conteúdo — não ocupam espaço do layout. Não precisam de Client Component.
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
- Todo elemento interativo tem foco visível (`focus-visible:`).
- Botões só com ícone têm `aria-label`; imagens têm `alt`.
- Respeite `prefers-reduced-motion` (variante `motion-safe:`).
