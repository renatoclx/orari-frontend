# Stack Tecnológico — Orari

Resumo das tecnologias usadas no projeto, para referência rápida (ex.:
divulgação em portfólio/LinkedIn).

**Sobre o projeto:** sistema multi-empresa de gestão de agendamentos —
cadastro de clientes e serviços, agenda com agendamentos avulsos e
recorrentes, planos contratados pelos clientes e controle de pagamentos.

---

## Frontend

- **Next.js 16** (App Router, Server Components, Server Actions) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (base **Radix UI**) para componentes acessíveis
- **lucide-react** (ícones), **Sonner** (toasts), **react-day-picker** (calendário)
- **next-themes** (tema claro/escuro)
- Autenticação com cookies `httpOnly` e refresh token rotativo
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
