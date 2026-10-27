# Arquitetura Frontend

## Stack utilizada

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui (base Radix) para os componentes de interface
- Detalhes e bibliotecas em `stack-tecnologico.md`

## Estrutura

```
public/                      arquivos estáticos (logo) — fica na raiz do projeto
src/
  app/                       rotas (App Router)
    layout.tsx               layout raiz: fonte, tema (next-themes), toasts
    globals.css              tokens de cor, foco global, barras de rolagem
    (admin)/                 área administrativa (sidebar + header)
      layout.tsx             busca o usuário logado e monta o AdminShell
      actions.ts             Server Actions da área (ex.: logout)
      people-actions.ts      Server Actions de pessoas (cadastro, alteração,
                             exclusão, reativação, contatos, endereços)
      service-actions.ts     Server Actions de serviços (cadastro, alteração,
                             inativação, exclusão)
      appointment-actions.ts Server Actions da agenda (disponibilidade do dia e
                             do período, busca de clientes, criar, alterar e
                             cancelar)
      recurrence-actions.ts  Server Actions de recorrências (criar, consultar,
                             listar sessões, cancelar, cancelar e remanejar
                             sessão, observação)
      plan-actions.ts        Server Actions de planos (cadastro, alteração,
                             inativação e ativação)
      client-plan-actions.ts Server Actions de contratações (contratar,
                             consultar com parcelas, cancelar)
      user-actions.ts        Server Actions de usuários (cadastro, alteração,
                             senha, inativação e reativação)
      payment-method-actions.ts Server Actions de métodos de pagamento
                             (cadastro, alteração, inativação e reativação)
      payment-actions.ts     Server Action da baixa de pagamentos (um ou vários
                             do mesmo cliente)
      location-actions.ts    busca de cidades e consulta de CEP
      page.tsx               Agendamentos ("/"): agenda do dia (?date=)
      servicos/              Serviços: page e loading (cadastro e alteração
                             em dialog)
      recorrencias/          Recorrências: page, nova/, [id]/
      pacotes/               Pacotes: planos/ (page, loading, novo/,
                             [id]/editar/) e contratacoes/ (page, nova/, [id]/)
      configuracoes/         Configurações da empresa: page
      company-actions.ts     Server Action das configurações (nome fantasia,
                             logo e horários de funcionamento)
      clientes/              Clientes: page, loading, novo/, [id] (histórico) e
                             [id]/editar/
      usuarios/              Usuários: page e loading (cadastro, alteração e
                             senha em dialog)
      financeiro/            Financeiro: page (Pagamentos), comandas/ e
                             metodos-de-pagamento/ (cada um com page e loading)
      anamnese/              Anamnese: modelos/ (lista, novo/, [id]/editar/),
                             fichas/ (Fichas preenchidas, nova/) e auditoria/
      clientes/[id]/anamnese/[fichaId]/  ficha completa, acompanhamento/ e
                             pdf/route.ts (Route Handler que entrega o PDF)
      anamnesis-actions.ts   Server Actions das fichas (nova ficha, acompanhamento
                             e fichas de um cliente)
      anamnesis-template-actions.ts  Server Actions dos modelos de ficha
      funcionarios/          Funcionários (mesma estrutura)
      profissionais/         Profissionais (mesma estrutura)
    (auth)/                  telas públicas (sem sidebar)
      layout.tsx             dois painéis: formulário + painel da marca
      login/                 página e Server Action do login
    session-expired/route.ts apaga os cookies da sessão e leva ao login
  components/
    ui/                      componentes do shadcn/ui (nomes em minúsculas)
    layout/                  estrutura: AdminShell, Sidebar, Header, ActionBar,
                             UserMenu, ThemeToggle, AppToaster, Logo
    shared/                  componentes do Orari usados em várias telas
    people/                  telas de Clientes, Funcionários e Profissionais
                             (uma implementação, parametrizada por tipo);
                             history/ tem o histórico do cliente
    services/                tela de Serviços (listagem e dialog de formulário)
    agenda/                  agenda do dia (grade, blocos, legenda, faixa)
    recurrences/             recorrências (lista, cadastro, detalhes, sessões,
                             remanejar)
    plans/                   planos (lista, formulário, preços e validação)
    client-plans/            contratações (lista, nova, detalhes, dialog)
    users/                   usuários (lista, dialogs de formulário e senha,
                             validação)
    payment-methods/         métodos de pagamento (lista e dialog de formulário)
    payments/                pagamentos (resumo, filtros, lista, baixa)
    checkouts/               comandas do dia (lista e dialog da comanda)
    anamnesis/               anamnese: templates/ (modelos e editor de perguntas),
                             records/ (fichas, acompanhamento, PDF) e audit/
                             (auditoria); AnamnesisAccessProvider (acesso)
    settings/                configurações da empresa (formulário, logo, horários)
    <tela>/                  componentes das demais telas (auth/)
  services/                  comunicação com a API e sessão (somente servidor)
  types/                     tipos do domínio, espelhando o backend
  utils/                     funções puras (datas, formatação, máscaras)
  lib/                       cn() do shadcn e helpers das Server Actions
                             (action-result.ts, form-data.ts), uuid.ts e
                             anamnesis-guard.ts (404 sem acesso à anamnese)
docs/                        documentação; screens/ tem um arquivo por tela
  proxy.ts                   proteção das rotas (antigo middleware)
next.config.ts               modo standalone, limite das Server Actions e rewrite de /uploads
Dockerfile, .dockerignore    imagem de produção (ver "Deploy")
vitest.config.mts            testes (arquivo.spec.ts ao lado do código; ver frontend-testing.md)
.github/workflows/ci.yml     lint, tipos, testes e build a cada push e PR
```

- Pastas entre parênteses (`(admin)`, `(auth)`) são **grupos de rotas**: organizam layouts sem mudar a URL.
- Hooks próprios ficam junto da tela que os usa (ex.: `components/agenda/useAgendaClock.ts`). Uma pasta `hooks/` só será criada quando um hook for usado por mais de uma tela.

## Organização

- As páginas não devem conter regras de negócio.
- Toda comunicação com a API deve ocorrer através da camada `services`.
- Os componentes devem ser reutilizáveis sempre que possível.

## Fluxo de dados

```
Tela (Server Component) ─┐
Server Action ───────────┼─→ <assunto>.service.ts ─→ apiFetch (services/api.ts) ─→ API NestJS
Layout ──────────────────┘
```

- **`apiFetch`** (`services/api.ts`) é o ponto único de chamada à API: monta a URL com `API_URL`, envia JSON sem cache, anexa o token da sessão e transforma erros em `ApiError` (status + mensagem). Status `0` = API fora do ar. Um 401 em chamada autenticada leva ao login (`/session-expired`).
- **Services por assunto** (`auth.service.ts`, `people.service.ts`, `contact.service.ts`, `address.service.ts`, `location.service.ts`, `cep.service.ts`, `service.service.ts`, `appointment.service.ts`, `recurrence.service.ts`, `plan.service.ts`, `client-plan.service.ts`, `payment.service.ts`, `payment-method.service.ts`, `user.service.ts`, `business-hour.service.ts`, `company.service.ts`, `anamnesis.service.ts`, `anamnesis-template.service.ts`, `audit.service.ts`) conhecem os caminhos da API e são chamados pelas telas, layouts e Server Actions — nunca o `apiFetch` direto.
- **`apiFetchBytes`** (`services/api.ts`) é a variante para respostas que são arquivo (o PDF da ficha): devolve os bytes sem passar pelo parser de JSON (o `apiFetch` leria como texto e corromperia o arquivo) e não redireciona no 401, porque quem chama é um Route Handler que responde ao navegador.
- Os services importam `server-only`: rodam só no servidor. O navegador nunca fala com a API diretamente.
- Server Actions tratam `ApiError` (viram mensagem na tela) e deixam estourar erros inesperados — inclusive o `redirect()` do Next, que também é lançado como erro.

## Server Components x Client Components

- **Server Component** (padrão): roda no servidor, pode ler cookies e chamar services. As telas são montadas no servidor a cada requisição (SSR).
- **Client Component** (`"use client"`): só quando há estado, eventos ou APIs do navegador, no menor componente possível. Também é montado no servidor e "hidratado" no navegador.
- De Server para Client só passam **dados** (texto, número, data, objetos simples) — nunca funções. Ex.: o `Calendar` recebe `locale` com funções, então quem o usa é Client Component.
- O que depende do navegador (tema, `matchMedia`) só é decidido depois de montar (`useSyncExternalStore`), para não divergir do HTML do servidor.

## Pessoas (clientes, funcionários e profissionais)

As três telas são a mesma implementação, escolhida pelo tipo (`PeopleType`).

- **`people-kinds.ts`** é a configuração por tipo: caminho (`/clientes`), nomes no plural e no singular. Cada rota é só uma página fina que passa o tipo a `PeopleListPage`, `NewPersonPage` ou `EditPersonPage`.
- **`PersonForm`** serve ao cadastro e à alteração (prop `editing`). `ContactsField` e `AddressesField` também têm os dois modos.
- **Cadastro:** o formulário inteiro vai por `FormData` a `createPersonAction`; o contato principal e as listas vão em `POST /people` (uma transação na API). A foto é enviada em seguida, por rota própria; se falhar, só avisa.
- **Alteração:** `updatePersonAction` faz `PATCH /people/:id` (a API recusa contatos e endereços nesse corpo), atualiza o contato principal e trata a foto. Contatos e endereços adicionais usam as rotas próprias e valem na hora. Falhas depois de salvar a pessoa viram avisos, não erro.
- **Inativos:** a listagem traz ativos e inativos (status derivado de `deletedAt`); excluir inativa e há "Reativar". A consulta por id também serve inativos (é o que o histórico usa); a tela de alteração trata o inativo como "não encontrado".
- O cadastro rápido de cliente (nome e telefone) usa o campo `phone` da API; o completo envia o contato principal em `contacts`.
- **Filtro de status** (`?status=` na URL: todos, ativos, inativos): `PeopleToolbar` troca o filtro e a API recebe `isActive`. A listagem de inativos só mostra o botão "Reativar".
- O formulário (`PersonForm`) tem o contêiner de rolagem `relative`: os inputs escondidos do Radix (Select, Switch) são absolutos e, sem isso, aumentavam a altura da página.

## Histórico do cliente

- Página `/clientes/[id]` (botão "Histórico" na coluna Ações, também para o cliente inativo, que só é consultado); só clientes (os outros tipos dão 404).
- `ClientHistoryPage` (Server Component) busca a pessoa, o contato principal e cinco contagens do cabeçalho (próximo agendamento, concluídos, pacotes ativos, cancelamentos e faltas), cada uma com os filtros que a API já tem. Só a aba aberta (`?aba=`) carrega os dados; o filtro dos agendamentos fica em `?quando=` (`history-filters.ts`, um `.ts` comum: um valor importado de um módulo `"use client"` chegaria ao servidor só como referência).
- Os agendamentos usam as ações da agenda em dialog (detalhes, alterar, remanejar, ver sessões e contratação), com o mesmo `AppointmentDetailsDialog`. Pagamentos: só leitura.

## Fotos

- O backend serve as fotos publicamente em `/uploads/people/<arquivo>`; a API devolve só o caminho relativo.
- O `next.config.ts` reescreve `/uploads/:path*` para `${API_URL}/uploads/:path*`, e o proxy não intercepta esse caminho. O navegador nunca conhece o endereço da API.
- O envio passa por Server Action (multipart). O limite do corpo das Server Actions foi elevado de 1 MB para 3 MB, porque a foto pode ter até 2 MB.
- Regras da foto (backend): JPEG ou PNG, até 2 MB, opcional.

## Serviços

- Listagem em página (`/servicos`), com busca e paginação pela URL; cadastro e alteração em **dialog** (`ServiceFormDialog`), como `screens/servicos.md` especifica.
- Ativar e inativar usam `PATCH /services/:id` (`isActive`); a exclusão é recusada pela API (409) quando há agendamentos, recorrências ou planos vinculados, e a tela orienta a inativar.
- O preço chega da API como texto (`Decimal`) e é enviado como número; a máscara BRL guarda centavos no formulário.
- O atalho de cadastro de serviço da barra lateral abre o mesmo dialog de qualquer tela.

## Agenda

- `AgendaDayPage` (Server Component) busca, em paralelo, os profissionais ativos, os agendamentos do dia, o horário de funcionamento do dia da semana e as opções do formulário (clientes e serviços). A tela é montada por `AgendaDayView` (Client Component): barra, grade e diálogos.
- O dia fica na URL (`?date=aaaa-mm-dd`) e o filtro de profissional também (`?professional=`); os botões de dia e o calendário do atalho levam os dois. Sem data (ou data inválida), exibe hoje.
- Tudo é calculado no **fuso da empresa** (`company.timezone`): `dayBounds` converte o dia para o intervalo UTC que a API filtra; `toTimeString` converte os horários exibidos.
- **Relógio vivo** (`useAgendaClock`): o "agora" avança sem recarregar a página (linha do horário atual, horários passados, possibilidade de cancelar), e os dados são buscados de novo a cada minuto e ao voltar para a aba (`router.refresh`). Com a aba escondida, nada roda.
- A faixa da grade (`agenda-range.ts`) vai da abertura mais cedo menos 2 h ao fechamento mais tarde mais 2 h, ampliada por agendamentos fora dela. Fora das janelas, a grade é hachurada; o intervalo entre janelas é cinza. Pausas por profissional não existem no backend.
- **Novo agendamento e encaixe:** mesmo dialog (`NewAppointmentDialog`). Os horários são calculados no navegador (`agenda-availability.ts`) a partir das janelas e dos agendamentos do profissional na data, buscados pela Server Action `getAvailabilityAction`. O comum exige caber inteiro em uma janela; o encaixe, ficar inteiro fora delas (sem atravessar a meia-noite) e grava com `overBooking: true`. As Server Actions ficam em `appointment-actions.ts` (disponibilidade, busca de clientes, criar e cancelar).
- **Cancelar:** única ação de status no dialog de detalhes, só antes de o agendamento iniciar. A regra também é imposta pelo backend (400 ao cancelar o que já iniciou); a tela só esconde o botão e mostra a mensagem do servidor se ele recusar.
- No celular, um profissional por vez, trocado por um menu ao lado do nome no cabeçalho da coluna; no computador, uma coluna por profissional (padrão: todos os ativos; o filtro mostra só um).
- **Remanejar** (`RescheduleAppointmentDialog` → `RescheduleSessionDialog`): só data e horário. O agendamento comum grava por `updateAppointmentAction`; a sessão de recorrência, por `rescheduleRecurrenceSessionAction`, e o período da recorrência é buscado ao abrir (`getRecurrenceAction`), porque a agenda não o conhece. O encaixe não tem remanejar.
- Sessões de recorrência vêm marcadas pela API (`recurringAppointment: { id, clientPlanId }`); o cancelamento delas vai pela rota da recorrência. `recurrence-label.tsx` dá o rótulo e o ícone da origem (`Repeat` ou `Package`). No detalhe, "Ver sessões" e "Ver contratação" abrem dialogs (`RecurrenceSessionsDialog`, `ClientPlanDialog`) sem sair da agenda.
- `getCurrentUser` usa `cache` do React: layout e página compartilham a chamada a `/auth/me` na mesma requisição.

## Recorrências

- Listagem (`/recorrencias`) com filtros de profissional e status na URL; detalhes (`/recorrencias/[id]`) com as sessões, que vêm de `GET /appointments?recurringAppointmentId=` (todas as páginas); cadastro em página (`/recorrencias/nova`).
- `recurrence.service.ts` converte as datas de calendário da API (instante à meia-noite UTC) para `aaaa-mm-dd`.
- Cadastro: `RecurrenceDaysField` mostra, na linha de cada dia marcado, os horários livres em **todas** as datas do período. Uma busca só (`getPeriodAvailabilityAction`: janelas da semana e agendamentos não cancelados do profissional e do cliente entre as datas) e a conta no navegador (`period-availability.ts` → `periodStarts`, que cruza o `availableStarts` de cada data). O campo aceita `extraBusy` (sessões já escolhidas na mesma tela) e `maxDays` (limite de dias, usado na contratação). `recurrence-schedule.ts` calcula as ocorrências do resumo, o limite de 12 meses (`addMonths`) e os rótulos de dia. O servidor confere tudo de novo (tudo ou nada).
- Sessões: `RecurrenceSessions` (tabela com remanejar e cancelar sessão) é usada na página da recorrência e no `RecurrenceSessionsDialog`, que busca a recorrência e as sessões ao abrir (agenda e contratação) e mostra "Tentar de novo" se a busca falhar.
- A busca de clientes do cadastro está em `useClientSearch` (a do dialog de novo agendamento ainda tem a mesma lógica própria).
- O dialog de remanejar (`RescheduleSessionDialog`) é o mesmo da agenda: recebe o profissional, a duração, o período (opcional) e a função que grava.

## Pacotes (planos e contratações)

- **Planos** (`/pacotes/planos`): listagem com busca e status na URL (o `ListSearch` aceita `query` para manter outros filtros); cadastro e alteração em página (`PlanForm`), com `ServicesPicker` (serviços com preço e atendimentos por semana) e `PlanPeriodsField` (períodos com a prévia). `plan-pricing.ts` faz as contas em centavos inteiros (`BigInt`), com o mesmo arredondamento do backend, e o valor sugerido (preço × vezes por semana × 4). `plan-validation.ts` vale na tela e na action. A API recebe `services: [{ serviceId, sessionsPerWeek }]`.
- **Contratações** (`/pacotes/contratacoes`): listagem com filtros de cliente, plano e status (`?status=` da API); a situação é derivada por `clientPlanStatus` (mesma regra do filtro). Nova contratação (`ClientPlanForm`): um `ScheduleBlock` por serviço, que usa o `RecurrenceDaysField` com `maxDays` (frequência do plano) e `extraBusy` (sessões dos outros serviços). `ClientPlanSummary` mostra a prévia dos valores e o comparativo com o avulso.
- Detalhes e dialog: `ClientPlanParts` (dados, agendas e parcelas) é usado pela página (`ClientPlanDetails`, com cancelar) e pelo `ClientPlanDialog`, aberto pela agenda. As parcelas vêm de `GET /payments?clientPlanId=` (`payment.service.ts`), só leitura.
- `client-plan.service.ts` converte as datas de calendário para `aaaa-mm-dd` e renomeia `recurringAppointments` para `schedules`.

## Usuários

- Listagem (`/usuarios`) paginada, com o tipo em badge (`UserTypeBadge`) e o status; cadastro e alteração em dialog (`UserFormDialog`) e troca de senha em outro (`PasswordDialog`). A validação (`user-validation.ts`) vale na tela e nas Server Actions, com as regras de senha do backend (8 a 72 bytes).
- Inativar e reativar (`PATCH /users/:id/restore`) por ação à vista na linha. O usuário logado não se inativa nem muda o próprio tipo, e o ADMIN não atribui SUPER_ADMIN (a API também recusa).

## Métodos de pagamento

- Listagem em `/financeiro/metodos-de-pagamento`, com busca, status e paginação pela URL; cadastro e alteração no mesmo dialog (`PaymentMethodFormDialog`).
- A listagem traz ativos e inativos (`deletedAt`); as baixas usam só os ativos (`isActive=true`). Inativar e reativar à vista na linha; o nome é único sem diferenciar maiúsculas nem acentos (o servidor responde 409 e a tela mostra no campo).

## Anamnese

Módulo de dado de saúde (LGPD). Detalhes e destaques técnicos em `screens/anamnese.md`; decisões em `decisions.md`.

- **Acesso:** ADMIN ou usuário vinculado a profissional ativo (`utils/anamnesis-access.ts`); só o ADMIN cuida de modelos e da auditoria. As páginas usam `lib/anamnesis-guard.ts` (404); as Server Actions conferem de novo; a API recusa (403) de qualquer forma. O `AnamnesisAccessProvider` (contexto no `AdminShell`) leva o acesso ao dialog do agendamento, que aparece em três telas.
- **Privacidade:** nada de saúde em `localStorage`, cookies, URL ou log; sem cache; rascunho só em memória; fichas imutáveis. Os ids da URL e das actions são conferidos como UUID (`lib/uuid.ts`) antes de entrar no caminho da API.
- **Lógica fora dos componentes:** `template-validation.ts`, `answer-form.ts` (tela ⇄ API: `parseAnswer`, `buildNewAnswers`, `changedAnswers`), `answer-format.ts`, `entry-validation.ts`, `audit-filters.ts` e `pdf-error.ts`, todos com teste.
- **PDF:** `clientes/[id]/anamnese/[fichaId]/pdf/route.ts` lê o token do cookie httpOnly, busca o PDF com `apiFetchBytes` e devolve os bytes (`application/pdf`, `no-store`); o `AnamnesisPdfDialog` mostra o arquivo num iframe de URL de blob, que só existe na memória da página.
- **Listagens:** `GET /anamnesis/clients` (clientes com ficha e quantidade, numa chamada e com uma auditoria) alimenta a tela Fichas preenchidas; a API não tem listagem geral de fichas.

## Financeiro

Duas telas, sem entidade nova no backend: a comanda é uma visão montada a partir de atendimentos e pagamentos.

- **Pagamentos** (`/financeiro`): `PaymentsListPage` (Server Component) lê os filtros da URL (`?status=`, `?de=`, `?ate=`, `?cliente=`, `?metodo=`, `?page=`) e busca, em paralelo, a listagem, o resumo, os métodos e os clientes. As situações do filtro e o `paymentQuery`, que monta a URL mantendo só o que não é o padrão, ficam em `payment-filters.ts` (`.ts` comum, usado pelo servidor e pela barra de filtros). Data inválida na URL é ignorada.
- **Resumo:** `GET /payments/summary` devolve atrasado, a vencer e recebido, respeitando cliente e vencimento mas não a situação. Cada cartão é um link que aplica a situação; o cartão ativo desfaz o filtro. No celular a barra de filtros some e só os cartões filtram.
- **Baixa:** `PaymentList` (Client Component) guarda a seleção (só pagamentos pendentes de um cliente por vez, que é a exigência da API) e abre o `SettlePaymentsDialog`. O método e a data do pagamento (`SettleFields`) são compartilhados com a comanda. `settlePaymentsAction` grava com `PATCH /payments/settle` (tudo ou nada); uma data passada vai ao meio-dia do fuso da empresa, para não virar o dia anterior, e a data futura é recusada.
- **Atendimento e contratação:** o ícone de olho abre o mesmo `AppointmentDetailsDialog` da agenda, só para consulta (`getAppointmentDetailsAction`); pagamento de pacote abre `ClientPlanDialog`.
- **Comandas** (`/financeiro/comandas`): `GET /payments/checkouts` parte das visitas do dia (clientes com atendimento hoje ou que pagaram hoje) e devolve, por cliente, os atendimentos de hoje, as pendências anteriores e os totais. `CheckoutList` mostra aberta ou paga; `CheckoutDialog` tem as seções "Atendimentos de hoje", "Pendências anteriores" e "Pagos hoje" e dá baixa nos itens marcados. Os da visita começam marcados e as pendências, não; a comanda paga abre só para consulta.
- Soma de valores sempre em centavos inteiros, para não acumular erro de ponto flutuante. Depois da baixa, `revalidatePath` recarrega as duas telas.

## Empresas (SUPER_ADMIN)

- Rota `/empresas` (`CompaniesListPage`, Server Component): quem não é SUPER_ADMIN recebe `notFound()`; o item do menu só entra para esse perfil (`Sidebar`, prop `isSuperAdmin`). Status (`?status=`) e página pela URL; `listCompanies` usa o filtro `isActive` da API.
- `CompanyList` (lista, visualizar, inativar e reativar) e `CompanyFormDialog` (cadastro e alteração) seguem o padrão de Usuários. A validação (`company-validation.ts`, com os dígitos de CPF e CNPJ em `utils/document.ts`) vale na tela e em `company-admin-actions.ts`, que também confere o perfil antes de chamar a API.
- Depois do cadastro, `CompaniesToolbar` abre o `UserFormDialog` com `forCompany` (tipo fixo ADMIN e `companyId`), reaproveitando o cadastro de usuários; `createUserAction` passou a aceitar o `companyId`.
- As ações da própria empresa (nome fantasia, logo e horários) continuam em `company-actions.ts`; as do SUPER_ADMIN ficam em `company-admin-actions.ts`.

## Configurações da empresa

- Página (`/configuracoes`) monta, no servidor, os dados da empresa (`GET /companies/:id`) e as janelas de funcionamento; `CompanySettingsForm` (Client Component) é o card único, com identidade, dados cadastrais (passados como `details`) e `BusinessHoursField`.
- `saveCompanySettingsAction` recebe um `FormData` só com o que mudou (`fantasyName`, `logo` ou `removeLogo`, `hours` em JSON) e grava nas rotas `/companies/me`, `/companies/me/logo` e `/business-hours`, nessa ordem. Depois `revalidatePath("/", "layout")`, para o header (nome e logo) refletir a mudança.
- Os horários são gravados pela diferença: o servidor lê as janelas atuais, exclui as que saíram, altera as que mudaram e cria as novas em lote. As regras (abertura antes do fechamento, sem sobreposição) estão em `business-hours-validation.ts` e valem na tela e na action.
- A logo do header (`CompanyLogo`) usa `next/image` com `unoptimized` e some se não carregar; o `key` é o endereço da logo, para recomeçar quando ela muda.
- O tema claro/escuro vive no menu do usuário (`ThemeMenuItem`); o switch com sol e lua (`ThemeToggle`) só aparece na tela de login.

## Sessão e rotas protegidas

Resumo; detalhes em `frontend-auth.md`.

- Tokens em cookies `httpOnly`; o navegador não acessa o token.
- `proxy.ts` roda antes de toda tela: renova a sessão quando o access token venceu e protege as rotas (sem sessão → `/login`; com sessão em `/login` → `/`).
- Cookies só podem ser gravados/apagados em Server Actions, Route Handlers e no proxy — nunca durante a renderização de uma página.

## Layout e interface

As regras visuais (tokens, componentes, padrão de página, barra de ações, toasts, textos) estão na skill `.claude/skills/orari-ui/SKILL.md`. Em resumo:

- A página não rola; o componente principal tem rolagem própria.
- Barra de ações fixa à direita em todas as telas administrativas (no celular, os atalhos vão para o header).
- Toasts (Sonner) pelo `AppToaster`, já presente no layout raiz.
- Acessibilidade: o `AdminShell` tem o link "Pular para o conteúdo" e a barra de atalhos é um `<aside>` com nome; `globals.css` reúne a regra de movimento reduzido e o `touch-action`. As regras e as verificações estão na seção "Acessibilidade" da skill.

## Deploy (Docker)

Produção: `https://app.orariapp.com.br`, no mesmo servidor do backend (Docker Compose com `db`, `api`, `frontend` e Caddy). O Compose e o Caddy ficam no repositório do backend; aqui está a imagem.

- **Imagem** (`Dockerfile` na raiz, `node:24-alpine`), em três etapas: `deps` (`npm ci`, camada reaproveitada enquanto o `package-lock.json` não muda), `build` (`next build`) e `run`. Só a última vai a produção: o resultado do `output: "standalone"` (45 MB, sem o `node_modules` inteiro) mais `.next/static` e `public/`, que o standalone não copia sozinho. Roda como o usuário `node` (não root) com `node server.js`.
- **`sharp` não é necessário:** todas as imagens são SVG (logos do Orari) ou `unoptimized` (logo da empresa e prévia), então não há otimização de imagem.
- **Medidas (2026-10-23):** imagem de 304 MB em disco (75,6 MB comprimida, a maior parte é a base do Node); construção a frio ~2 min (`npm ci` 86 s, compilação 14 s) e ~17 s com as dependências em cache; pico de 1,5 GB de memória no build, sem usar troca (o servidor tem 3,8 GB de RAM e 1 GB de troca); 62 MiB em repouso.
- **`.dockerignore`** deixa de fora `node_modules`, `.next`, `.git`, `.env*` (menos o `.env.example`), `docs`, `prompts`, `.claude`, `coverage` e os `.md`. A imagem não contém nenhum `.env*` (conferido).

### Variáveis

| Variável           | Quando               | Observação                                                                                                                                                                                                                                                    |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_URL`          | **build e execução** | `http://api:3333` dentro do Compose. No build (`--build-arg API_URL=...`, o build falha sem ela) porque o `next.config.ts` a grava na reescrita de `/uploads`; na execução, para o login, a renovação e as telas. O valor do build vira o padrão da execução. |
| `PORT`, `HOSTNAME` | execução             | `3000` e `0.0.0.0` (já definidos na imagem).                                                                                                                                                                                                                  |
| `NODE_ENV`         | execução             | `production` (já definida, só depois do build).                                                                                                                                                                                                               |
| `AUTH_GUARD`       | nunca em produção    | `off` libera as rotas sem login em desenvolvimento; em produção o proxy a ignora, mas ela não deve existir no servidor.                                                                                                                                       |

Sem segredos na imagem: nenhuma variável sensível é necessária (o token vive em cookies do usuário).

### O que o Compose do backend precisa saber

- **Build:** `context: ../orari-frontend` (a pasta do repositório ao lado de `orari-backend`) e `args: API_URL=http://api:3333`.
- **Execução:** `environment: API_URL=http://api:3333`; a porta é a `3000`, **só na rede interna** (`expose`, sem `ports`). O Caddy faz `reverse_proxy frontend:3000`.
- **Healthcheck** já está na imagem (`wget` em `http://127.0.0.1:3000/login`, que responde 200 sem sessão); o Compose pode usá-lo com `condition: service_healthy`.
- **Caddy:** o `reverse_proxy` padrão já repassa o `Host` e sobrescreve o `X-Forwarded-For` com o IP real da conexão. As duas coisas importam: o Next compara `Origin` e `Host` nas Server Actions, e o IP é o que o frontend repassa à API (ver `frontend-auth.md`, "IP do usuário").
- **HTTPS é obrigatório:** os cookies da sessão são `secure` em produção.

### Verificado na prática

Imagem real, contêiner atrás de um Caddy local com a API real: `/login` 200, healthcheck saudável, usuário `node`, redirecionamento de rota protegida para `/login`, estáticos e ícones sem sessão, `/uploads` (fotos e logo da empresa) chegando à API, login pela Server Action sem erro de origem, cookies `httpOnly`/`secure`/`SameSite=Lax`, e o `X-Forwarded-For` chegando à API (com o valor forjado pelo cliente descartado pelo Caddy).

## Configuração

| Arquivo           | Conteúdo                                                                      | No git |
| ----------------- | ----------------------------------------------------------------------------- | ------ |
| `.env.local`      | `API_URL`; `AUTH_GUARD=off` (só desenvolvimento: libera as rotas)             | não    |
| `.env.example`    | lista das variáveis, sem valores reais                                        | sim    |
| `components.json` | configuração do shadcn/ui                                                     | sim    |
| `next.config.ts`  | modo `standalone`, limite do corpo das Server Actions e rewrite de `/uploads` | sim    |
| `Dockerfile`      | imagem de produção (três etapas)                                              | sim    |
| `.dockerignore`   | o que não entra na imagem                                                     | sim    |

`API_URL` não tem o prefixo `NEXT_PUBLIC_`: fica só no servidor. Para o deploy (variáveis no build e na execução), ver a seção "Deploy (Docker)".
