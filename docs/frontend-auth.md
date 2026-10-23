# Autenticação (Frontend)

> Complementa o `auth.md` do backend, que define tokens, rotação e regras de acesso.

## Visão geral

```
[ Navegador ]  ⇄  [ Servidor do Next ]  ⇄  [ API NestJS ]
  cookies          proxy, Server Actions,     valida senha e tokens
  httpOnly         services, apiFetch
```

O navegador nunca fala com a API e nunca acessa o token: quem chama a API é o servidor do Next, usando os cookies que o navegador envia.

## Tokens e cookies

| Cookie          | Conteúdo              | Validade                                                 |
| --------------- | --------------------- | -------------------------------------------------------- |
| `orari_access`  | access token (JWT)    | lida do próprio token (campo `exp`); vence junto com ele |
| `orari_refresh` | refresh token (opaco) | 7 dias, igual ao `JWT_REFRESH_EXPIRES_IN` do backend     |

Opções: `httpOnly` (o JavaScript da página não lê), `secure` em produção (só HTTPS), `sameSite: "lax"`, `path: "/"`.

Arquivos:

- `services/session-cookies.ts`: nomes e montagem dos cookies. Sem `server-only`, porque o proxy também usa.
- `services/session.ts` (`server-only`): `getAccessToken`, `getRefreshToken`, `setSession`, `clearSession`.
- `services/auth.service.ts` (`server-only`): `login`, `logout`, `getCurrentUser` — as rotas `/auth/*` da API.

Gravar e apagar cookies só funciona em Server Actions, Route Handlers e no proxy. Páginas e layouts apenas leem.

## Login

1. O formulário (`LoginForm`, Client Component com `useActionState`) envia para a Server Action `login`.
2. A action valida os campos no servidor e chama `POST /auth/login`, repassando o IP do usuário (ver "IP do usuário").
3. Sucesso: `setSession(tokens)` grava os cookies e redireciona para `/?loggedIn=1`.
4. Erro: 401 vira "E-mail ou senha incorretos." (genérica, não revela qual campo errou); API fora do ar vira "Não foi possível conectar ao servidor.".

O `redirect()` fica fora do `try/catch`: ele funciona lançando um erro especial do Next.

## Chamadas autenticadas

O `apiFetch` lê o `orari_access` e envia `Authorization: Bearer <token>` quando ele existe. Toda tela que usa a API lê cookies e, portanto, é renderizada a cada requisição.

## Usuário logado

O `(admin)/layout.tsx` chama `getCurrentUser()` (`GET /auth/me`) uma vez e repassa o usuário (`CurrentUser`) ao `AdminShell` → `Header` → `UserMenu` (nome, tipo em português, e-mail e empresa). Sem sessão válida, o `apiFetch` leva ao login (ver "Sessão recusada pela API").

## Logout

1. Avatar → menu → "Sair" → diálogo de confirmação.
2. A Server Action `logout` lê o refresh token e chama `POST /auth/logout`, que revoga a sessão no backend.
3. `clearSession()` apaga os cookies e redireciona para `/login?loggedOut=1`.
4. Se a API falhar, sai mesmo assim (o refresh token não revogado vence sozinho).

## Toasts de entrada e saída

| Evento | Sinal na URL         | Quem mostra                                               | Mensagem                |
| ------ | -------------------- | --------------------------------------------------------- | ----------------------- |
| Entrar | `/?loggedIn=1`       | `WelcomeToast`, no `AdminShell` (lê `useSearchParams`)    | "Olá, <primeiro nome>!" |
| Sair   | `/login?loggedOut=1` | `AuthNoticeToast`, na página de login (lê `searchParams`) | "Até logo!"             |

Os dois usam `id` fixo (evita duplicar em desenvolvimento) e limpam a URL com `router.replace`.

## IP do usuário (limite de tentativas da API)

A API limita tentativas por IP (em produção: login 5 por minuto e renovação 20 por minuto) e roda com `TRUST_PROXY=1`. Como todas as chamadas vêm do servidor do Next, sem ajuda ela enxergaria um IP só, e o limite valeria para **todos os usuários juntos**.

- Em produção o Caddy recebe a requisição do navegador, sobrescreve o `x-forwarded-for` com o IP real da conexão e a repassa ao Next.
- `lib/client-ip.ts` (`clientIpFrom`) lê esse cabeçalho: só o **primeiro valor**, e só se tiver formato de IP (IPv4 ou IPv6); ausente ou malformado, nada é enviado. Sem a validação, um valor forjado ou com quebra de linha viraria cabeçalho para a API.
- **Login:** a Server Action lê `headers()` e passa o IP a `authService.login(email, senha, ip)`, que o envia à API em `X-Forwarded-For` pelo `apiFetch` (a regra de passar pelos services continua).
- **Renovação:** o `proxy.ts` lê `request.headers` e envia o mesmo cabeçalho no `POST /auth/refresh` (a exceção que já existia à regra dos services).
- Com `TRUST_PROXY=1`, a API usa o valor mais à direita do `X-Forwarded-For`; como o Next envia um valor só, é o do usuário.
- Fora de produção (sem Caddy) não há cabeçalho, e nada é enviado.

## Proxy (`src/proxy.ts`)

Roda antes de toda requisição, exceto arquivos estáticos. Duas tarefas:

**1. Renovar a sessão** — o cookie do access token vence junto com o token; quando ele some:

```
sem access token, com refresh token → POST /auth/refresh
  ├─ sucesso      → grava os tokens novos na requisição (para a página atual)
  │                 e na resposta (para o navegador) → segue
  ├─ recusado     → apaga os cookies → /login
  └─ API fora do ar → segue sem renovar (ninguém é deslogado por queda da API)
```

- Requisições simultâneas com o mesmo refresh token **compartilham uma única renovação** (o Next pré-carrega várias telas ao mesmo tempo, e a rotação só aceita o primeiro uso). O resultado fica guardado por 10 s.
- O Next esconde do proxy os cabeçalhos de pré-carregamento (`RSC`, `next-router-prefetch`); por isso não dá para filtrar pré-cargas.
- O proxy chama a API com `fetch` direto: é a única exceção à regra dos services (o proxy não pode importar `server-only`).

**2. Proteger as rotas** (checagem otimista: só verifica se existe cookie; quem valida o token é a API):

- Sem sessão fora do login → `/login`.
- Com sessão no login → `/`.
- Desenvolvimento: `AUTH_GUARD=off` no `.env.local` desliga só estes redirecionamentos (a renovação continua valendo). **Em produção a variável é ignorada** (`lib/auth-guard.ts`, `isAuthGuardEnabled`): as rotas sempre pedem login, mesmo que `AUTH_GUARD=off` vá parar no servidor.

## Sessão recusada pela API (401)

O proxy não sabe se o token é válido. Quando a API recusa uma chamada autenticada (token revogado, usuário excluído, empresa inativa):

```
service → apiFetch → 401 → redirect("/session-expired")
  → Route Handler apaga os cookies → /login?expired=1 → toast "Sua sessão expirou."
```

- `apiFetch` com `authenticated: false` (login e logout) não envia token e não segue esse fluxo: lá, 401 significa senha errada.
- O `redirect()` lança um erro próprio do Next. Por isso todo `catch` deve tratar só `ApiError` e repassar o resto — assim o redirecionamento nunca é "engolido".
- `/session-expired` existe porque páginas não podem apagar cookies; Route Handlers podem.

## Avisos na tela de login

| URL                  | Toast                             |
| -------------------- | --------------------------------- |
| `/login?loggedOut=1` | sucesso: "Até logo!"              |
| `/login?expired=1`   | informação: "Sua sessão expirou." |

Componente `AuthNoticeToast`, com `id` fixo e limpeza da URL.

## Arquivos

| Arquivo                                                                      | Papel                                           |
| ---------------------------------------------------------------------------- | ----------------------------------------------- |
| `proxy.ts`                                                                   | renovação e proteção das rotas                  |
| `lib/client-ip.ts`                                                           | IP do usuário a partir do `x-forwarded-for`     |
| `lib/auth-guard.ts`                                                          | `AUTH_GUARD=off` só fora de produção            |
| `services/api.ts`                                                            | `apiFetch`: token, erros, 401 → sessão expirada |
| `services/auth.service.ts`                                                   | `login`, `logout`, `getCurrentUser`             |
| `services/session.ts` / `session-cookies.ts`                                 | ler, gravar e apagar os cookies                 |
| `app/(auth)/login/actions.ts`                                                | Server Action do login                          |
| `app/(admin)/actions.ts`                                                     | Server Action do logout                         |
| `app/session-expired/route.ts`                                               | apaga os cookies e leva ao login                |
| `app/(admin)/layout.tsx`                                                     | busca o usuário logado                          |
| `components/layout/UserMenu.tsx`                                             | menu do usuário e confirmação de saída          |
| `components/layout/WelcomeToast.tsx` / `components/auth/AuthNoticeToast.tsx` | toasts de entrada, saída e sessão expirada      |

## Limitações conhecidas

Ver `frontend-technical-debt.md`.
