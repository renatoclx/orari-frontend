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
      location-actions.ts    busca de cidades e consulta de CEP
      page.tsx               Agendamentos ("/")
      clientes/              Clientes: page, loading, novo/, [id]/editar/
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
                             (uma implementação, parametrizada por tipo)
    <tela>/                  componentes de cada tela (agenda/, auth/)
  services/                  comunicação com a API e sessão (somente servidor)
  types/                     tipos do domínio, espelhando o backend
  utils/                     funções puras (datas, formatação, máscaras)
  lib/utils.ts               cn() do shadcn
  proxy.ts                   proteção das rotas (antigo middleware)
next.config.ts               limite das Server Actions e rewrite de /uploads
```

- Pastas entre parênteses (`(admin)`, `(auth)`) são **grupos de rotas**: organizam layouts sem mudar a URL.
- `hooks/` será criada quando existir o primeiro hook próprio.

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
- **Services por assunto** (`auth.service.ts`, `people.service.ts`, `contact.service.ts`, `address.service.ts`, `location.service.ts`, `cep.service.ts`) conhecem os caminhos da API e são chamados pelas telas, layouts e Server Actions — nunca o `apiFetch` direto.
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
- **Inativos:** a listagem traz ativos e inativos (status derivado de `deletedAt`); excluir inativa e há "Reativar". As rotas por id respondem 404 para inativos (a tela mostra "não encontrado").
- O cadastro rápido de cliente (nome e telefone) usa o campo `phone` da API; o completo envia o contato principal em `contacts`.

## Fotos

- O backend serve as fotos publicamente em `/uploads/people/<arquivo>`; a API devolve só o caminho relativo.
- O `next.config.ts` reescreve `/uploads/:path*` para `${API_URL}/uploads/:path*`, e o proxy não intercepta esse caminho. O navegador nunca conhece o endereço da API.
- O envio passa por Server Action (multipart). O limite do corpo das Server Actions foi elevado de 1 MB para 3 MB, porque a foto pode ter até 2 MB.
- Regras da foto (backend): JPEG ou PNG, até 2 MB, opcional.

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

## Configuração

| Arquivo           | Conteúdo                                                          | No git |
| ----------------- | ----------------------------------------------------------------- | ------ |
| `.env.local`      | `API_URL`; `AUTH_GUARD=off` (só desenvolvimento: libera as rotas) | não    |
| `.env.example`    | lista das variáveis, sem valores reais                            | sim    |
| `components.json` | configuração do shadcn/ui                                         | sim    |
| `next.config.ts`  | limite do corpo das Server Actions e rewrite de `/uploads`        | sim    |

`API_URL` não tem o prefixo `NEXT_PUBLIC_`: fica só no servidor.
