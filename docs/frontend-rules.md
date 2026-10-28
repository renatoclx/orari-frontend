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
- **Listagens novas usam `ListCard`** (`components/shared/`): ele traz a casca (cartão com rolagem, mensagem de vazio, cartões no celular, tabela a partir de `md`, rodapé); a listagem só entrega `columns`, `rows`, `cards`, `emptyMessage`, `footer` e os diálogos. Uma regra de layout das listas passa a mudar em um lugar só.
- Controles só com ícone usam `Hint` (dica descritiva) e `aria-label`; não use o `title` nativo.
- Botões e campos têm 40 px (ver a skill `orari-ui`).
- A especificação de cada tela está em `docs/screens/<tela>.md`; consulte antes de alterar uma tela.

## Definição de pronto

Uma tela ou mudança de interface só está pronta quando:

- **Celular (390 px, altura útil de 664 px):** sem rolagem lateral na página nem nos diálogos; modais inteiros dentro da tela (com rolagem por dentro, se altos); botões seguem a regra de botões no celular da skill `orari-ui`.
- **Tema escuro** conferido.
- **Estados:** carregando (`loading.tsx`), vazio (com mensagem que não engana, como "nenhum encontrado para...") e erro com o texto da API.
- **Teclado e dicas:** foco visível; nenhuma dica aberta ao abrir um diálogo.
- **Verificada na tela, com a API real**, e não só nos tipos. Descreva o que foi visto no PR.
- **Testes:** regra nova em função pura tem `*.spec.ts`; tela nova entra em `ROUTES` (e o diálogo, em `DIALOGS`) de `e2e/smoke.e2e.ts`.
- **Conferências:** `npm run lint`, `npx tsc --noEmit` e `npm test`; `npm run test:e2e` quando o layout muda.
- **Documentação** no mesmo PR (abaixo).

### Documentação junto do PR

- O PR que muda uma tela atualiza `docs/screens/<tela>.md` (uma ou duas linhas bastam) e, se criou ou mudou um padrão de interface, a skill `orari-ui`.
- A passada completa nos documentos transversais (`frontend-architecture.md`, `decisions.md`, `frontend-technical-debt.md`, `docs/screens/README.md`) continua **ao terminar um módulo**.
- Os manuais do usuário (`docs/manual-usuario/`) são revistos quando uma tela que eles mostram muda de comportamento.

## Código

- Todo código novo leva comentário curto explicando o **porquê** (e não o que o código faz). Evite comentar o óbvio.
- Resultados e regras repetidas entre telas viram componente ou helper compartilhado, não cópia.
