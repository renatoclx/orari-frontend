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
- **Todo botão com texto tem ícone à esquerda** (lucide, `<Icon aria-hidden="true" />` antes do texto; o `Button` já dá o espaço). O ícone indica a ação e é sempre o mesmo para ela, também quando o texto muda durante o envio ("Salvando…"). Exceções: botões de escolha de dado (horários da agenda) e o item de lista/seleção. Mapa: Salvar → `Save`; Cadastrar/Adicionar/Novo → `Plus`; Cancelar e Fechar (desistir) → `X`; Voltar → `ArrowLeft`; Cancelar um registro (agendamento, sessão, recorrência) e Inativar → `Ban`; Excluir e Remover → `Trash2`; Alterar → `Pencil`; Remanejar → `CalendarSync`; Agendar → `CalendarPlus`; Hoje → `CalendarCheck`; Entrar → `LogIn`; Ver sessões → `ListChecks`; Ver contratação e pacote → `Package`; Contratar → `FileSignature`; Usar valor sugerido → `Calculator`; Tentar de novo, Mostrar todos e Reativar → `RotateCcw`; Alterar senha → `KeyRound`; Dar baixa e Receber → `HandCoins`; Ver, Visualizar e Detalhes (só ícone) → `Eye`; Limpar filtros e seleção → `X`. Ação nova usa o ícone mais evidente do lucide e entra neste mapa.
- **Informação de outra tela abre em dialog**, não em outra página (ex.: sessões da contratação; sessões e contratação a partir da agenda). O dialog busca os dados ao abrir, mostra "Buscando…" e, se falhar, "Tentar de novo".
- **Dias da semana com limite** (contratação): ao atingir a quantidade, os dias não marcados ficam desabilitados (switch desabilitado e nome em cinza); desmarcar libera os demais.
- **Formulário com rolagem própria** (card com `overflow-auto`) é `relative`, para os inputs escondidos do Radix (Switch e Select num form) não aumentarem a altura da página.
- O `ConfirmDialog` recebe o ícone do botão de confirmação (`icon`); o botão de desistir usa `X` (ou `ArrowLeft` quando o texto é "Voltar").
- **Tamanhos: botões e campos têm 40 px** (`h-10`; ícones `size-10`). Valem para `Button`, `Input`, `Select` (gatilho), `DatePicker`, `Combobox` e o campo de busca dentro das caixas de seleção. Variações: `sm` 36 px, `lg` 44 px, `icon-sm` 32 px. Não use `h-8` ou `h-9` à mão; ajuste o componente em `components/ui/` se precisar mudar.
- Login: botão e campos com `h-14 text-base` (56 px, texto 16 px), só nessa tela.
- **Botões no celular (abaixo de `sm`)**:
  - **Ação principal sozinha** (Novo X, Nova ficha, Novo acompanhamento, Cancelar contratação, Abrir): ocupa a largura do bloco (`w-full sm:w-auto` ou `max-sm:w-full`).
  - **Duas ou mais ações no mesmo bloco** (agenda, dados da recorrência): empilhadas, cada uma na largura toda, a principal em cima (`max-sm:flex-col-reverse` quando ela vem por último no código).
  - **Rodapé de formulário em página** (`FormFooter`): lado a lado, em partes iguais (já é assim; a legenda fica na linha de cima). Rótulo longo encurta no celular (`Registrar<span className="max-sm:hidden"> acompanhamento</span>`) para caber. O rodapé do diálogo (`DialogFooter`) é empilhado.
  - **Ação secundária numa linha de tabela ou cartão** (Ver sessões): só o ícone no celular (`max-sm:size-10 max-sm:p-0`, texto em `max-sm:sr-only`).
  - **Ação só de computador** (Imprimir/PDF) e atalhos que o celular já tem em outro lugar (setas e "Hoje" da agenda, no lugar do calendário do cabeçalho) somem no celular (`max-sm:hidden`).
  - Nunca deixar um botão estourar a largura da tela: sem rolagem lateral na página nem no diálogo.

## Badges

Padrão do sistema (`docs/screen-patterns.md`): cor correspondente à informação e texto pesado em caixa alta (o `Badge` já aplica `font-bold uppercase`; escreva o texto normalmente).

- Status ativo/inativo: use `StatusBadge` (`@/components/shared/StatusBadge`, `active={...}`); não recrie a badge nas telas.
- `variant="success"` (verde, token `success`): ativo e informações positivas.
- `variant="destructive"` (vermelho): inativo e informações negativas.
- Outros significados ainda sem cor definida: pergunte antes de escolher.

## Listagens

Fonte das regras: `docs/screen-patterns.md` e `docs/screens/pessoas.md`. Modelo: `src/components/people/` (`PeopleListPage`, `PersonList`, `PeopleToolbar`).

- **Pessoas (cliente, funcionário, profissional) compartilham as mesmas telas.** A diferença está só em `PEOPLE_KINDS` (`@/components/people/people-kinds`): tipo, caminho, singular e plural. Textos usam `kind.singular` / `kind.plural`; nunca escreva "cliente" direto em componente de `people/`.
- Cada tipo tem rotas finas: `app/(admin)/<caminho>/{page,loading}.tsx` e `novo/page.tsx`, que só escolhem o `kind` e delegam a `PeopleListPage`, `PeopleListLoading` e `NewPersonPage`. Para outro tipo, acrescente a entrada em `PEOPLE_KINDS` e as três rotas.
- Server Actions de pessoas (`app/(admin)/people-actions.ts`) recebem o tipo do navegador e o conferem com `isPeopleType` antes de usar. Usuários são outra entidade (`UserType`): não usam estas telas.

- **Componentes compartilhados das listagens e diálogos** (`@/components/shared/`), usados por Pessoas e Serviços: `ListCard` (casca da listagem: cartões no celular, tabela a partir de `md`, vazio e rodapé), `ListSearch` (busca durante a digitação), `StatusBadge`, `EmptyValue` (mostra "--") e `ConfirmDialog` (confirmação com texto de andamento; `destructive` para o botão vermelho). Antes de escrever um diálogo de confirmação ou uma busca, use estes.
- A página é um Server Component que lê `searchParams` (`q`, `page`) e busca pelo service; o card (`PersonList`/`ServiceList`) ocupa a largura e a altura que sobram, com a tabela rolando por dentro e o rodapé de paginação fixo (`TablePagination`).
- Busca durante a digitação: o `ListSearch` espera ~350 ms e troca `?q=` na URL com `router.replace`; a página é renderizada de novo no servidor, na primeira página.
- Botão "Novo <entidade>" leva à tela de cadastro. Vazios aparecem como "--".
- Status (ativo/inativo, derivado de `deletedAt`) com `Badge` (`success` / `destructive`).
- Coluna Ações: "Alterar" em destaque (ícone) e as demais ações num menu de três pontos (`DropdownMenu modal={false}`), na ordem Visualizar, Excluir. Estilo neutro. Alterar e Excluir ficam desabilitados para registros excluídos.
- Visualizar abre `Dialog` com Fechar; Excluir abre o `ConfirmDialog` com o nome do registro, botão vermelho e "Excluindo…" enquanto executa.
- Carregamento: `loading.tsx` com `Skeleton`. No celular, a tabela vira lista empilhada.
- **Filtros na URL** (Pagamentos, Contratações): a barra é um Client Component que troca o parâmetro com `router.push` (volta à primeira página); a página lê e valida os `searchParams` no servidor, ignorando valor inválido. As opções de um filtro que o servidor e o cliente usam ficam num `.ts` comum (`payment-filters.ts`), não num módulo `"use client"`. "Limpar filtros" aparece só com filtro fora do padrão. Padrão: `Select` para situações curtas, `DatePicker` para datas (com `maxDate` longe quando se filtra o futuro) e `Combobox` com `useClientSearch` para clientes.
- **Cartão de resumo** (`PaymentsSummary`): link para a listagem filtrada, na grade `sm:grid-cols-3`. Ícone em círculo tingido (`bg-destructive/10`, `bg-muted`, `bg-success/15`), faixa de 6 px na borda esquerda com a cor da situação (vermelho, neutro, verde; sem contornar o cartão), valor grande na mesma cor (neutro no "a vencer") e a contagem em `text-muted-foreground`. Ativo: só o fundo tingido (`bg-destructive/5`, `bg-muted/60`, `bg-success/5`) e `aria-current`; clicar no ativo desfaz o filtro. Cores sempre pelos tokens (`destructive`, `success`); no escuro, `dark:text-red-400` no vermelho, como na badge. Quando os cartões filtram, a barra de filtros some no celular.
- **Lista com seleção e baixa em lote** (`PaymentList`): caixa de seleção na primeira coluna (`accent-primary`), só nas linhas que aceitam a ação; ao marcar uma, as que não podem entrar no mesmo lote ficam desabilitadas com `Hint` explicando. Uma barra `bg-muted` no topo do card mostra "N selecionados · total" e as ações.
- **Dialog de comanda** (`CheckoutDialog`): seções com título pequeno e lista em `divide-y` dentro de um quadro com borda; as linhas quebram (`flex-wrap`) para o selo e o valor irem para baixo no celular; o total fica fora da área rolável. Estados de item com `Badge` (`secondary` para "Aguardando conclusão" e "Incluído no pacote").
- **Status em coluna própria** (`StatusBadge` na coluna Status), também quando o item pode ser inativo (Fichas preenchidas): não encoste a badge no nome.
- **Dialog aberto a partir de uma linha que busca os dados ao abrir** (`ClientAnamnesesDialog`): esqueleto enquanto carrega, erro em `role="alert"`, `key` pelo item para refazer a busca; sem caixa de orientação quando a tela já é intuitiva.
- **Lista longa de itens editáveis em accordion** (`QuestionCard`): `Collapsible` por item, vários abertos ao mesmo tempo, linha de resumo (número, texto e tipo) com a alça de arrastar e a lixeira fora da área clicável, botão "Recolher todas / Expandir todas" e a pergunta com erro abre sozinha ao enviar.

## Formulários

Fonte das regras: `docs/screen-patterns.md` (padrões) e `docs/screens/` (campos e layout de cada tela, um arquivo por tela: `pessoas.md`, `servicos.md`, `agendamentos.md`...). Consulte os dois antes de criar uma tela de cadastro ou alteração.

- **Segue o padrão de página:** o card do formulário é o componente principal — ocupa a **largura toda e a altura que sobra** (`flex min-h-0 flex-1 flex-col rounded-card border bg-card`). Nunca limite a largura do card nem o faça acompanhar a altura do conteúdo. Raiz da página: `flex min-h-0 flex-1 flex-col gap-4`, com título e subtítulo acima.
- Estrutura do card: área de campos (`min-h-0 flex-1 overflow-auto p-4 md:p-6`) + `FormFooter` (`@/components/shared/FormFooter`) fixo no fim, com borda no topo e botões à direita (Cancelar, depois a ação principal). Os botões ficam **dentro** do `<form>`. A legenda "Campos obrigatórios" vai na prop `note` do rodapé.
- Duas colunas que ocupam a **largura toda do card** (`gap-x-12 gap-y-6 md:grid-cols-2`, sem `max-w`): dados principais à esquerda; opcionais à direita, em `FormSection` (recolhíveis, com `border-t`). No celular, uma coluna.
- Equilibre a altura das colunas (a seção opcional mais usada pode iniciar aberta: `defaultOpen`) e mantenha espaçamentos moderados.
- Obrigatórios com `*` em `text-destructive`. Dentro do `Label`, rótulo e asterisco num único `<span>` (o `Label` espaça os filhos).
- Foto da pessoa: `PhotoUpload` (`@/components/shared/PhotoUpload`), círculo centralizado **acima das colunas**; opcional; escolhida do dispositivo ("Selecionar foto") ou tirada na câmera ("Tirar foto", `CameraCaptureDialog`, recorte quadrado em JPEG); JPEG ou PNG até 2 MB (regras do backend); o envio é feito depois do cadastro, por rota própria.
- Data: `DatePicker` (`@/components/shared/DatePicker`), com calendário; envia "aaaa-mm-dd".
- Campos com máscara (celular, CPF, CEP): `MaskedInput` com as máscaras de `@/utils/masks`; exibe formatado e envia só os dígitos.
- Seleção com busca (estado, cidade, cliente): `Combobox` (`@/components/shared/Combobox`). Listas grandes buscam no servidor por `onSearchChange`. Nas caixas de seleção com campo de busca dentro, o campo tem `margin-top` de 0.5rem (`mt-2` no `CommandInput`), para não colar na borda da caixa.
- Itens repetíveis (contatos, endereços de pessoas): `ContactsField` e `AddressesField` (`@/components/people/`): o formulário aparece ao clicar em adicionar, os itens vão para uma tabela com lixeira. Dentro do `<form>`, o Enter nesses sub-formulários adiciona o item (não envia o cadastro).
- `FormSection` mantém o conteúdo montado quando recolhida (`forceMount`), para não perder o que foi digitado.
- Textos longos: `Textarea` com `min-h-28` (4 linhas).
- **Salvar:** o formulário inteiro vai por `FormData` a uma Server Action (`createClientAction`); listas (contatos e endereços adicionais) vão em campos ocultos com JSON e a foto no campo de arquivo. O botão do diálogo de confirmação mostra "Cadastrando…" e a ação valida de novo no servidor. Erro de um campo (ex.: CPF duplicado, 409) aparece no campo; os demais, em aviso. Sucesso: aviso e volta para a listagem.
- **Dialog de formulário** (ex.: serviços, `ServiceFormDialog`): cadastro e alteração no mesmo dialog (`sm:max-w-lg`), com `DialogFooter` (borda no topo, botões à direita: Cancelar e a ação principal, com "Cadastrando…"/"Salvando…"). Sem diálogo de confirmação sobre o dialog. O conteúdo só existe com o dialog aberto (campos limpos a cada abertura); ao fechar, guarde o item em estado para o título não mudar durante a animação. Rótulo e erro por `FormField` (`@/components/shared/FormField`).
- Preço: `MaskedInput` com `maskCurrency` (guarda centavos, envia dígitos; a action divide por 100). Cor opcional: `ColorField` (`@/components/shared/ColorField`, paleta fixa de círculos sem borda, ✓ na escolhida; clicar de novo ou "Remover cor" tira a cor).
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
- Header: nome fantasia da empresa à esquerda (só do tablet em diante), logo da empresa (`CompanyLogo`; some sem logo ou se não carregar) e usuário logado. O menu do usuário (avatar) reúne Configurações da empresa (`/configuracoes`: um card único com identidade, dados cadastrais e horários, rodapé fixo com "Descartar" e "Salvar alterações"), o tema claro/escuro (item com switch, que não fecha o menu) e Sair. Na tela de login, o tema continua como switch com sol e lua (`ThemeToggle`).
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

## Agenda

Fonte: `docs/screens/agendamentos.md`. Modelo: `src/components/agenda/`.

- O dia exibido (`?date=`) e o filtro de profissional (`?professional=`) ficam na URL; anterior, próximo, hoje e o calendário do atalho levam os dois. O filtro é aplicado na tela e vai para a URL com `history.replaceState` (sem buscar os dados de novo). Padrão: todos os profissionais ativos; "Mostrar Todos" sempre visível.
- Datas e horários sempre no fuso da empresa (`utils/time.ts`: `dayBounds`, `toTimeString`); a API trabalha em UTC.
- **Relógio vivo** (`useAgendaClock`): o "agora" anda sem recarregar (linha do horário atual, horários passados, botão de cancelar) e os dados são buscados de novo a cada minuto e ao voltar para a aba (`router.refresh`). Nunca calcule "agora" no servidor para a tela.
- Rótulo e ícone de cada status vêm de `appointment-status.ts` (bloco e legenda usam a mesma fonte). Concluído, cancelado e não compareceu ficam esmaecidos; o encaixe é cinza exclusivo (`OVERBOOKING_COLOR`, campo `overBooking` da API).
- A faixa da grade é calculada em `agenda-range.ts` (expediente ± 2 h, ampliada por agendamentos fora dela). Fora das janelas: hachurado e clicável para encaixe; entre janelas: cinza "Intervalo" (só visual, também encaixe). Cancelado só aparece se não ficar sobreposto a nada.
- **Novo agendamento e encaixe** (`NewAppointmentDialog`, mesmo dialog): cliente com busca no servidor, serviço com busca, profissional, data (sem passado), horários em `AvailableTimes` (caixa de período Manhã/Tarde/Noite, só os com horário, e botões). Os horários vêm de `agenda-availability.ts` (grade de 15 min mais o fim de cada agendamento): comum = cabe em uma janela; encaixe = inteiro fora das janelas e até a meia-noite. A busca de disponibilidade (janelas e agendamentos do profissional na data) é a Server Action `getAvailabilityAction`. Encaixe grava com `overBooking: true` e mostra aviso fixo.
- **Detalhes do agendamento:** "Cancelar" (vermelho, com confirmação) e "Remanejar" lado a lado, centralizados, enquanto não iniciou; o encaixe não tem "Remanejar". Sessão de recorrência mostra "Recorrente" (ícone `Repeat`) e a de pacote, "Sessão de pacote" (ícone `Package`); as duas trocam o "Alterar" por "Ver sessões" (dialog), e a de pacote tem também "Ver contratação" (dialog). A legenda mostra "Recorrente" e "Pacote". Início e fim são automáticos (job do backend). **Nada no passado é alterado:** "Cancelar" e "Alterar" só aparecem antes do início.
- **Alterar agendamento:** o mesmo `NewAppointmentDialog` em modo de alteração (prop `editing`), preenchido, com "Salvar alterações" habilitado só se algo mudou; envia só os campos alterados (`updateAppointmentAction`). Mantém o tipo: comum só dentro do expediente; encaixe só fora, reenviando `overBooking: true`. O próprio horário conta como livre (`ignoreAppointmentId` na busca de disponibilidade).
- O carregamento usa `Suspense` com `key` no dia, no `page.tsx` (um `loading.tsx` na raiz de `(admin)` valeria para todas as telas).

- **Ícones dentro do bloco do agendamento têm todos 16×16** (`size-4`): status, encaixe, recorrência e pacote.
- **Dialog de detalhes do agendamento:** sem botão "Fechar" no rodapé (o X do canto fecha); os botões ficam **centralizados e em uma só linha** e o dialog alarga (`sm:max-w-xl`) quando são três ou mais; sem botões, sem rodapé. O atalho "Anamnese" aparece só para quem acessa as fichas.

## Barra de ações lateral

- Componente único `@/components/layout/ActionBar`, renderizado pelo `AdminShell`: aparece em **todas** as telas administrativas a partir do tablet (`md`). Não adicione barras por página.
- **No celular, a barra some** e só o calendário aparece, como ícone no header (`CalendarShortcut` com `placement="header"`); os demais atalhos (cliente, serviço) ficam ocultos (`docs/screens/layout.md`). Atalhos atuais: calendário (`CalendarShortcut`), cadastro rápido de cliente (`QuickClientShortcut`, diálogo só com nome e telefone), cadastro de serviço (`QuickServiceShortcut`, abre o `ServiceFormDialog` de qualquer tela) nova recorrência (`QuickRecurrenceShortcut`, link para a página de cadastro) e comandas do dia (`QuickCheckoutShortcut`, ícone de recibo, link para `/financeiro/comandas`).
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

Verificada com `axe-core` (todas as rotas, claro e escuro, computador e celular) e com a skill `web-design-guidelines` (Etapa 9, 2026-10-22). Tela nova: confira o mesmo antes de fechar.

- HTML semântico: `<header>`, `<nav>`, `<main>`, `<aside>` (com `aria-label`), `<button>` para ações, `<a>` para navegação. Elemento que se comporta como botão e não é `<button>` (ex.: o bloco da agenda) leva `role="button"`, `tabIndex={0}` e abre com Enter **e** Espaço. `role="button"` não vale em `<article>`.
- Todo elemento interativo tem foco visível: use elementos nativos ou `tabindex`, que já recebem o contorno global (azul, 1 px; a cor é decisão do projeto e não muda). Não use `outline-none` sem substituto.
- **Nome acessível:** botões só com ícone têm `aria-label`; imagens têm `alt`. Se o botão tem texto visível, o `aria-label` **começa pelo texto visível** (WCAG 2.5.3: "Agendar às 07:30 com Carol", não "Novo agendamento com Carol"). `role="combobox"` não toma o nome do conteúdo: o `Combobox` sem `<label>` recebe `ariaLabel`. `<th>` nunca fica vazio: coluna só de botões usa `<span className="sr-only">Ações</span>`.
- **Contraste mínimo de 4,5:1 para texto pequeno**, inclusive sobre fundo tingido (badge, botão suave, avatar). Os tokens já cumprem; não use `opacity` para esmaecer texto (o bloco concluído da agenda clareia só o fundo e a faixa). Cor de texto sempre por token (`text-muted-foreground`, `text-destructive`, `text-success`), nunca valor solto.
- **Texto de carregamento ou de espera** ("Buscando…", "Carregando…") é `role="status"`, para o leitor de tela anunciar sem tirar o foco. Erro de campo é `role="alert"` (`FormField` já faz).
- Primeiro item de teclado em `AdminShell`: "Pular para o conteúdo" (`#conteudo`, só aparece com foco).
- **Movimento:** a regra global de `globals.css` já zera animações e transições para quem pede `prefers-reduced-motion`; use a variante `motion-safe:` em animações novas de enfeite. Transição só nas propriedades que mudam (`transition-colors`, `transition-[...]`), nunca `transition-all`.
- Toque: `touch-action: manipulation` é global. Diálogos e gavetas têm `overscroll-contain`.
- Texto da interface usa `…` (um caractere), nunca `...`. Botões seguem o padrão em pt-BR (só a primeira letra maiúscula).
