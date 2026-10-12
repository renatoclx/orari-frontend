# Stack Tecnológico — Orari

Resumo das tecnologias usadas no projeto, para referência rápida (ex.:
divulgação em portfólio/LinkedIn).

**Sobre o projeto:** sistema multi-empresa de gestão de agendamentos —
cadastro de clientes e serviços, agenda com agendamentos avulsos e
recorrentes, planos contratados pelos clientes e controle de pagamentos.

---

## Frontend

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **ESLint** (`eslint-config-next`) + **Prettier** (`prettier-plugin-tailwindcss`)

## Backend

- **NestJS** + **TypeScript**
- **Prisma** + **PostgreSQL**
- **Swagger/OpenAPI** para documentação da API
- **Vitest** para testes

## Infraestrutura de desenvolvimento

- Monorepo simples: `frontend/` (Next.js) + `backend/` (NestJS), desacoplados
  por contrato HTTP/JSON
- **Prettier + ESLint** nos dois projetos
