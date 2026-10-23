# Orari: frontend

Interface web do **Orari**, sistema de gestão de agendamentos para empresas
(clientes, serviços, agenda com encaixes, planos e pagamentos). Este projeto é o
frontend; o backend (NestJS) fica em `../backend`.

## Stack

Next.js 16 (App Router, Server Components e Server Actions), React 19,
TypeScript, Tailwind CSS v4 e shadcn/ui (Radix). Detalhes em
`docs/stack-tecnologico.md`.

## Como rodar

Pré-requisitos: Node.js 24+ e o backend rodando (ver o README do backend).

```bash
npm install
cp .env.example .env.local   # ajuste os valores
npm run dev                  # http://localhost:3000
```

### Variáveis de ambiente (`.env.local`)

| Variável     | Para que serve                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `API_URL`    | Endereço do backend (ex.: `http://localhost:3333`). Usada **só no servidor** do Next; o navegador nunca fala com a API. |
| `AUTH_GUARD` | Só em desenvolvimento: `off` libera as rotas sem login.                                                                 |

### Scripts

| Comando          | O que faz                                  |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | Servidor de desenvolvimento                |
| `npm run build`  | Build de produção (também confere tipos)   |
| `npm run start`  | Serve o build de produção                  |
| `npm run lint`   | ESLint                                     |
| `npm test`       | Testes (Vitest); `test:watch` e `test:cov` |
| `npm run format` | Prettier em todo o projeto                 |

## Como o projeto é organizado

```
src/app/            rotas e Server Actions (grupos (admin) e (auth))
src/components/     ui/ (shadcn), layout/, shared/ e um grupo por tela
src/services/       única camada que chama a API (somente servidor)
src/types/          tipos que espelham o backend
src/utils/, src/lib/ funções puras e helpers
docs/               documentação do projeto
```

O caminho de um dado: tela ou Server Action → `<assunto>.service.ts` →
`apiFetch` → API. Cookies `httpOnly` guardam a sessão.

## Documentação

Tudo em `docs/`:

- `frontend-architecture.md`: estrutura, fluxo de dados, módulos (pessoas, serviços, agenda)
- `frontend-auth.md`: sessão, cookies, renovação e rotas protegidas
- `frontend-rules.md` e `frontend-coding-standards.md`: regras e padrões de código
- `screens/`: especificação das telas, um arquivo por tela (comece pelo `README.md`)
- `screen-patterns.md`: padrões comuns das telas (listagem, tabela, formulário, diálogos)
- `decisions.md`: decisões do projeto e o porquê
- `frontend-testing.md`: testes automáticos (o que cobrem, convenções e como escrever)
- `frontend-technical-debt.md`: pontos conhecidos adiados de propósito
- `stack-tecnologico.md`: tecnologias usadas

Regras de interface (cores, tamanhos, componentes): skill
`.claude/skills/orari-ui/SKILL.md`. Instruções para o assistente de código:
`CLAUDE.md`.

## Convenções

- Código e arquivos em inglês; textos da interface em pt-BR.
- Imports com o alias `@/`; comentários curtos explicando o porquê.
- Antes de commitar: `npm run lint`, `npx tsc --noEmit`, `npm test` e `npm run format`.
