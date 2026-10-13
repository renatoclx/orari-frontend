# Claude Instructions

## Papel

Você e eu somos os desenvolvedores responsáveis pelo projeto.
O objetivo é construir uma aplicação consistente, simples, minimalista e funcional, com baixo acoplamento.

---

## Antes de alterar qualquer código

Consulte a documentação do frontend e a do backend.

### Frontend (`docs/`)

frontend-architecture.md
frontend-rules.md
frontend-coding-standards.md
frontend-auth.md
stack-tecnologico.md

Regras de interface: skill `.claude/skills/orari-ui/SKILL.md`.

### Backend (`../backend/docs/`)

Regras de negócio e domínio valem para os dois projetos.

architecture.md
coding-standards.md
auth.md
business-rules.md
domain.md
technical-debt.md

Consulta opcional (específicos do backend): database.md, implementation-summary.md.

Documentos adicionais (decisions.md, progress.md, journal.md) poderão ser
criados conforme o projeto evoluir. Quando existirem, também deverão ser
consultados antes de qualquer alteração.

---

## Fluxo obrigatório

Antes de implementar:

1. Analise o problema.
2. Explique o plano.
3. Aguarde aprovação.
4. Somente então altere os arquivos.

- Comandos bash e o uso do Python não necessitam de aprovação (regra aplicada via `.claude/settings.json`, não por este arquivo).

---

## Interpretação da documentação

Ao implementar funcionalidades:

- Considere a documentação como a especificação oficial do projeto.
- Não assuma requisitos que não estejam documentados.
- Caso exista alguma inconsistência entre os documentos, informe antes de implementar.
- Reflita as regras documentadas na implementação correspondente.

---

## Durante a implementação

- Não altere arquivos fora do escopo solicitado.
- Não faça refatorações não solicitadas.
- Respeite a arquitetura definida na documentação.
- Quando houver dúvida, pergunte.
- Antes de criar qualquer componente, página, hook, serviço, utilitário ou funcionalidade, verifique se já existe uma implementação reutilizável.
- Prefira reutilizar implementações existentes.
- Toda implementação deve respeitar estritamente o escopo solicitado.
- Não implemente funcionalidades futuras "aproveitando a oportunidade".
- Caso uma funcionalidade dependa de outra ainda não solicitada, informe essa dependência e aguarde aprovação.

---

## Componentes

- Componentes devem possuir apenas uma responsabilidade principal.
- Evite componentes excessivamente grandes.
- Extraia componentes reutilizáveis apenas quando existir ganho real de reutilização ou legibilidade.
- Evite abstrações desnecessárias.

---

## Organização

- Separar interface, lógica e comunicação com a API.
- Não implementar regras de negócio nas páginas.
- Centralizar chamadas HTTP na camada de serviços.
- Manter componentes focados na renderização sempre que possível.

---

## Planejamento

. Caso identifique uma abordagem melhor que a solicitada, apresente-a antes da implementação e aguarde aprovação.
. Nunca faça alterações em arquivos não relacionados apenas por oportunidade de melhoria.

---

## Aprendizado

Sempre que uma implementação envolver conceitos importantes de React, Next.js ou Tailwind CSS:

- Explique brevemente as decisões arquiteturais tomadas.
- Explique por que determinada abordagem foi escolhida.
- Não faça uma aula completa; seja objetivo.

---

## Ao finalizar

Informe:

- Arquivos modificados.
- Resumo da implementação.
- Possíveis impactos.
- Próximos passos.

Não atualize arquivos de documentação sem confirmação do usuário.

## Documentação e registro

- A documentação do projeto (`docs/`, `CLAUDE.md`) e as notas do Obsidian
  (roadmap, decisões e implementações) são atualizadas **ao terminar um módulo
  inteiro** (ex.: autenticação, clientes), em uma revisão completa — não a cada
  passo.
- Exceção: a skill `orari-ui` é atualizada quando uma decisão de interface é aprovada.
- Notas do Obsidian: `/home/renato/Documentos/Obsidian Vault/Orari-Frontend-*.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
