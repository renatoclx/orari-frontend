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
2. A action valida os campos no servidor e chama `POST /auth/login`.
3. Sucesso: `setSession(tokens)` grava os cookies e redireciona para `/?loggedIn=1`.
4. Erro: 401 vira "E-mail ou senha incorretos." (genérica, não revela qual campo errou); API fora do ar vira "Não foi possível conectar ao servidor.".

O `redirect()` fica fora do `try/catch`: ele funciona lançando um erro especial do Next.

## Chamadas autenticadas

O `apiFetch` lê o `orari_access` e envia `Authorization: Bearer <token>` quando ele existe. Toda tela que usa a API lê cookies e, portanto, é renderizada a cada requisição.

## Usuário logado

O `(admin)/layout.tsx` chama `GET /auth/me` uma vez e repassa o usuário (`CurrentUser`) ao `AdminShell` → `Header` → `UserMenu` (nome, tipo em português, e-mail e empresa). Sem sessão válida (401), redireciona para `/login`.

## Logout

1. Avatar → menu → "Sair" → diálogo de confirmação.
2. A Server Action `logout` lê o refresh token e chama `POST /auth/logout`, que revoga a sessão no backend.
3. `clearSession()` apaga os cookies e redireciona para `/login?loggedOut=1`.
4. Se a API falhar, sai mesmo assim (o refresh token não revogado vence sozinho).

## Toasts de entrada e saída

| Evento | Sinal na URL         | Quem mostra                                            | Mensagem                |
| ------ | -------------------- | ------------------------------------------------------ | ----------------------- |
| Entrar | `/?loggedIn=1`       | `WelcomeToast`, no `AdminShell` (lê `useSearchParams`) | "Olá, <primeiro nome>!" |
| Sair   | `/login?loggedOut=1` | `LogoutToast`, na página de login (lê `searchParams`)  | "Até logo!"             |

Os dois usam `id` fixo (evita duplicar em desenvolvimento) e limpam a URL com `router.replace`.

## Proxy (`src/proxy.ts`)

- Roda antes de toda requisição, exceto arquivos estáticos.
- Checagem otimista: verifica se existe algum cookie de sessão. Quem valida o token de verdade é a API.
- Sem sessão fora do login → `/login`. Com sessão no login → `/`.
- Desenvolvimento: `AUTH_GUARD=off` no `.env.local` desliga a proteção.

## Pendente

- Refresh automático no proxy: sem access token e com refresh token → `POST /auth/refresh` → cookies novos.
- Tratamento de 401 no meio da navegação: rota que apaga os cookies e leva ao login.
- Desligar o `AUTH_GUARD=off` e testar o fluxo completo.
