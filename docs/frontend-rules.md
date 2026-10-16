# Regras

- Mobile First.
- Utilizar Server Components quando possível.
- Utilizar Client Components apenas quando necessário.
- Evitar duplicação de componentes.
- Não acessar a API diretamente dentro dos componentes quando houver um service.
- Chamadas à API somente pelos services (que usam o `apiFetch`); nunca do navegador.
- Componentes de interface vêm do shadcn/ui (`src/components/ui/`); verificar antes de criar um novo.
- Cookies só são gravados ou apagados em Server Actions, Route Handlers e no proxy.
- A aplicação se encontra em fase MVP, tendo apenas o usuário Administrador nesta fase.

## Camadas e servidor

- A tela só antecipa as regras: **o backend é a autoridade**. Valide também no servidor (Server Actions) e trate os erros da API (400, 409) mostrando a mensagem recebida.
- Server Actions validam de novo o que vem do navegador e devolvem um resultado (`{ ok: true, ... }` ou `ActionFailure`), usando `failureFrom` (`lib/action-result.ts`); não deixam um `ApiError` estourar na tela.
- Datas e horários são exibidos e calculados no **fuso da empresa** (`utils/time.ts`); a API trabalha em UTC.
- O "agora" da tela vem do relógio da própria tela (ex.: `useAgendaClock`), nunca de um valor calculado só uma vez no servidor.

## Interface

- Reaproveite os componentes de `components/shared/` antes de criar outro: `ConfirmDialog` (confirmações), `StatusBadge`, `EmptyValue`, `ListSearch`, `FormField` e `Hint`.
- Ações destrutivas pedem confirmação em `ConfirmDialog`.
- Controles só com ícone usam `Hint` (dica descritiva) e `aria-label`; não use o `title` nativo.
- Botões e campos têm 40 px (ver a skill `orari-ui`).
- A especificação de cada tela está em `docs/screens/<tela>.md`; consulte antes de alterar uma tela.

## Código

- Todo código novo leva comentário curto explicando o **porquê** (e não o que o código faz). Evite comentar o óbvio.
- Resultados e regras repetidas entre telas viram componente ou helper compartilhado, não cópia.
