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
- Cores dos status da **agenda** (agendado, confirmado…) ainda não foram definidas: pergunte antes de inventar. Os status de cadastro (ativo/inativo) seguem o padrão de badges.

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

## Badges

Padrão do sistema (`docs/screen-patterns.md`): cor correspondente à informação e texto pesado em caixa alta (o `Badge` já aplica `font-bold uppercase`; escreva o texto normalmente).

- `variant="success"` (verde, token `success`): ativo e informações positivas.
- `variant="destructive"` (vermelho): inativo e informações negativas.
- Outros significados ainda sem cor definida: pergunte antes de escolher.

## Listagens

Fonte das regras: `docs/screen-patterns.md` e `docs/screens.md`. Modelo: `src/components/people/` (`PeopleListPage`, `PersonList`, `PeopleToolbar`).

- **Pessoas (cliente, funcionário, profissional) compartilham as mesmas telas.** A diferença está só em `PEOPLE_KINDS` (`@/components/people/people-kinds`): tipo, caminho, singular e plural. Textos usam `kind.singular` / `kind.plural`; nunca escreva "cliente" direto em componente de `people/`.
- Cada tipo tem rotas finas: `app/(admin)/<caminho>/{page,loading}.tsx` e `novo/page.tsx`, que só escolhem o `kind` e delegam a `PeopleListPage`, `PeopleListLoading` e `NewPersonPage`. Para outro tipo, acrescente a entrada em `PEOPLE_KINDS` e as três rotas.
- Server Actions de pessoas (`app/(admin)/people-actions.ts`) recebem o tipo do navegador e o conferem com `isPeopleType` antes de usar. Usuários são outra entidade (`UserType`): não usam estas telas.

- A página é um Server Component que lê `searchParams` (`q`, `page`) e busca pelo service; o card (`ClientList`) ocupa a largura e a altura que sobram, com a tabela rolando por dentro e o rodapé de paginação fixo (`TablePagination`).
- Busca durante a digitação: o campo (Client Component) espera ~350 ms e troca `?q=` na URL com `router.replace`; a página é renderizada de novo no servidor, na primeira página.
- Botão "Novo <entidade>" leva à tela de cadastro. Vazios aparecem como "--".
- Status (ativo/inativo, derivado de `deletedAt`) com `Badge` (`success` / `destructive`).
- Coluna Ações: "Alterar" em destaque (ícone) e as demais ações num menu de três pontos (`DropdownMenu modal={false}`), na ordem Visualizar, Excluir. Estilo neutro. Alterar e Excluir ficam desabilitados para registros excluídos.
- Visualizar abre `Dialog` com Fechar; Excluir abre `AlertDialog` com o nome do registro, botão vermelho e "Excluindo…" enquanto executa.
- Carregamento: `loading.tsx` com `Skeleton`. No celular, a tabela vira lista empilhada.

## Formulários

Fonte das regras: `docs/screen-patterns.md` (padrões) e `docs/screens.md` (campos e layout de cada entidade). Consulte os dois antes de criar uma tela de cadastro ou alteração.

- **Segue o padrão de página:** o card do formulário é o componente principal — ocupa a **largura toda e a altura que sobra** (`flex min-h-0 flex-1 flex-col rounded-card border bg-card`). Nunca limite a largura do card nem o faça acompanhar a altura do conteúdo. Raiz da página: `flex min-h-0 flex-1 flex-col gap-4`, com título e subtítulo acima.
- Estrutura do card: área de campos (`min-h-0 flex-1 overflow-auto p-4 md:p-6`) + `FormFooter` (`@/components/shared/FormFooter`) fixo no fim, com borda no topo e botões à direita (Cancelar, depois a ação principal). Os botões ficam **dentro** do `<form>`. A legenda "Campos obrigatórios" vai na prop `note` do rodapé.
- Duas colunas que ocupam a **largura toda do card** (`gap-x-12 gap-y-6 md:grid-cols-2`, sem `max-w`): dados principais à esquerda; opcionais à direita, em `FormSection` (recolhíveis, com `border-t`). No celular, uma coluna.
- Equilibre a altura das colunas (a seção opcional mais usada pode iniciar aberta: `defaultOpen`) e mantenha espaçamentos moderados.
- Obrigatórios com `*` em `text-destructive`. Dentro do `Label`, rótulo e asterisco num único `<span>` (o `Label` espaça os filhos).
- Foto da pessoa: `PhotoUpload` (`@/components/shared/PhotoUpload`), círculo centralizado **acima das colunas**; opcional; escolhida do dispositivo ("Selecionar foto") ou tirada na câmera ("Tirar foto", `CameraCaptureDialog`, recorte quadrado em JPEG); JPEG ou PNG até 2 MB (regras do backend); o envio é feito depois do cadastro, por rota própria.
- Data: `DatePicker` (`@/components/shared/DatePicker`), com calendário; envia "aaaa-mm-dd".
- Campos com máscara (celular, CPF, CEP): `MaskedInput` com as máscaras de `@/utils/masks`; exibe formatado e envia só os dígitos.
- Seleção com busca (estado, cidade): `Combobox` (`@/components/shared/Combobox`). Listas grandes buscam no servidor por `onSearchChange`.
- Itens repetíveis (contatos, endereços de pessoas): `ContactsField` e `AddressesField` (`@/components/people/`): o formulário aparece ao clicar em adicionar, os itens vão para uma tabela com lixeira. Dentro do `<form>`, o Enter nesses sub-formulários adiciona o item (não envia o cadastro).
- `FormSection` mantém o conteúdo montado quando recolhida (`forceMount`), para não perder o que foi digitado.
- Textos longos: `Textarea` com `min-h-28` (4 linhas).
- **Salvar:** o formulário inteiro vai por `FormData` a uma Server Action (`createClientAction`); listas (contatos e endereços adicionais) vão em campos ocultos com JSON e a foto no campo de arquivo. O botão do diálogo de confirmação mostra "Cadastrando…" e a ação valida de novo no servidor. Erro de um campo (ex.: CPF duplicado, 409) aparece no campo; os demais, em aviso. Sucesso: aviso e volta para a listagem.
- **Alteração:** mesma tela do cadastro (`PersonForm` com a prop `editing`; página `EditPersonPage`, rota `/<tipo>/[id]/editar`). Sem diálogo de confirmação; botão "Salvar alterações" ("Salvando…"). Salvar envia a pessoa (`PATCH`), o contato principal (`mainContactId`) e a foto (trocar, tirar ou "Remover"). Contatos e endereços adicionais valem **na hora** (a API os mantém em rotas próprias): adicionar mostra aviso; excluir pede confirmação. Falha depois de salvar a pessoa vira aviso, não erro. Pessoa inativa ou inexistente: `notFound()`.
- Foto exibida vem de `/uploads/...`: o `next.config.ts` reescreve para a API (e o proxy não intercepta `uploads/`). Server Actions aceitam corpo de até 3 MB por causa da foto.
- Contato principal do cadastro completo vai em `contacts` com `isPrincipal: true` (assim leva o tipo escolhido e o e-mail); o campo `phone` da API é só para o cadastro rápido (tipo fixo, sem e-mail). Limites da API: 10 contatos, 10 endereços, observação até 1000 caracteres.

## Tipografia

- Fonte única: Plus Jakarta Sans (já é a fonte padrão da página; não precisa de classe).
- Horários, datas e valores usam `tabular-nums`, para alinharem em coluna.
- Nada de rótulos em CAIXA ALTA — exceto as badges (ver "Badges").

## Forma

- Arredondamento pela hierarquia, sempre com os tokens:
  - `rounded-control`: botões, campos, selects.
  - `rounded-card`: cards e painéis.
  - `rounded-overlay`: modais, menus, toasts.
- Cards **sem sombra**: separam-se pelo fundo (`bg-card`) e pela borda (`border border-border`).
- Sombra só no que flutua sobre o conteúdo (modais, menus, toasts).

## Layout da área administrativa

- Itens de menu podem ser grupos (ex.: "Pessoas", com Clientes, Funcionários e Profissionais): expandida, a seção abre; recolhida, vira um menu ao lado do ícone.
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
- **No celular, a barra some** e os mesmos atalhos aparecem como ícones no header, para não cobrir o conteúdo. Cada atalho é um componente reutilizado nos dois lugares (ex.: `CalendarShortcut` com `placement="bar"` ou `"header"`). Atalhos atuais: calendário (`CalendarShortcut`) e cadastro rápido de cliente (`QuickClientShortcut`, diálogo só com nome e telefone).
- Fixa na borda direita da tela, centralizada na vertical, com cantos arredondados só à esquerda (`rounded-l-overlay`), sombra e sem borda à direita.
- Guarda atalhos secundários (hoje: calendário). Novos atalhos entram nela como botões de ícone com `aria-label` e `title`.
- Painéis abertos por ela usam o `Popover` do shadcn com `side="left"` e `sideOffset={0}`, colados à barra e flutuando sobre o conteúdo.
- O componente principal não reserva espaço para ela: a barra flutua sobre a borda dele.

## Toasts

- Biblioteca: **Sonner** (via shadcn). O `<AppToaster />` (`@/components/layout/AppToaster`) já está no layout raiz, **antes** do conteúdo — não adicione outro.
- Disparar: `import { toast } from "sonner"` → `toast.success("Cliente salvo")`, `toast.error(...)`, `toast.warning(...)`, `toast.info(...)`. Cada tipo já tem cor e ícone próprios (`richColors`).
- Posição: canto superior direito no computador; rodapé no celular (o `AppToaster` decide sozinho).
- Para o resultado de uma ação ("Agendado", "Cliente salvo"). Erros de formulário ficam no próprio campo, não em toast.
- Erro fica até ser fechado: `toast.error(mensagem, { duration: Infinity })`; os demais somem sozinhos.
- Toast depois de um redirecionamento (ex.: despedida do logout): a Server Action redireciona com um sinal na URL (`/login?loggedOut=1`), a página renderiza um componente cliente que dispara o toast com um `id` fixo (evita duplicar) e limpa a URL com `router.replace`. Se quem mostra o toast é um layout (ex.: boas-vindas, `?loggedIn=1`), a leitura é no navegador com `useSearchParams`, porque layouts não recebem `searchParams`.

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
