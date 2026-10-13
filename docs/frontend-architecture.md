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
      page.tsx               Agendamentos ("/")
      clientes/page.tsx      Clientes
    (auth)/                  telas públicas (sem sidebar)
      layout.tsx             dois painéis: formulário + painel da marca
      login/                 página e Server Action do login
  components/
    ui/                      componentes do shadcn/ui (nomes em minúsculas)
    layout/                  estrutura: AdminShell, Sidebar, Header, ActionBar,
                             UserMenu, ThemeToggle, AppToaster, Logo
    shared/                  componentes do Orari usados em várias telas
    <tela>/                  componentes de cada tela (agenda/, clients/, auth/)
  services/                  comunicação com a API e sessão (somente servidor)
  types/                     tipos do domínio, espelhando o backend
  utils/                     funções puras (datas, formatação)
  lib/utils.ts               cn() do shadcn
  proxy.ts                   proteção das rotas (antigo middleware)
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

- **`apiFetch`** (`services/api.ts`) é o ponto único de chamada à API: monta a URL com `API_URL`, envia JSON sem cache, anexa o token da sessão e transforma erros em `ApiError` (status + mensagem). Status `0` = API fora do ar.
- **Services por assunto** (`auth.service.ts`, `client.service.ts`...) conhecem os caminhos da API e são chamados pelas telas, layouts e Server Actions — nunca o `apiFetch` direto.
- Os services importam `server-only`: rodam só no servidor. O navegador nunca fala com a API diretamente.
- Server Actions tratam `ApiError` (viram mensagem na tela) e deixam estourar erros inesperados.

## Server Components x Client Components

- **Server Component** (padrão): roda no servidor, pode ler cookies e chamar services. As telas são montadas no servidor a cada requisição (SSR).
- **Client Component** (`"use client"`): só quando há estado, eventos ou APIs do navegador, no menor componente possível. Também é montado no servidor e "hidratado" no navegador.
- De Server para Client só passam **dados** (texto, número, data, objetos simples) — nunca funções. Ex.: o `Calendar` recebe `locale` com funções, então quem o usa é Client Component.
- O que depende do navegador (tema, `matchMedia`) só é decidido depois de montar (`useSyncExternalStore`), para não divergir do HTML do servidor.

## Sessão e rotas protegidas

Resumo; detalhes em `frontend-auth.md`.

- Tokens em cookies `httpOnly`; o navegador não acessa o token.
- `proxy.ts` roda antes de toda tela: sem sessão → `/login`; com sessão em `/login` → `/`.
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

`API_URL` não tem o prefixo `NEXT_PUBLIC_`: fica só no servidor.
