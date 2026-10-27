# Anamnese

> Ficha de saúde do cliente. É dado **sensível** (LGPD): o acesso é restrito, o backend criptografa as respostas e audita toda ação. Este documento é atualizado a cada etapa implementada. Plano das etapas: `prompts/anamnese-frontend.md`.

## Quem acessa

- **Fichas dos clientes:** o ADMIN e o usuário vinculado a um **profissional** ativo. Funcionário vinculado e usuário sem vínculo não acessam (a API responde 403).
- **Modelos de ficha e auditoria:** só o ADMIN.
- O SUPER_ADMIN só acessa fichas se estiver vinculado a um profissional da própria empresa.
- A regra de tela está em `utils/anamnesis-access.ts` (`anamnesisAccess`) e só esconde o que não vale; quem decide é a API.

## Menu (etapa A)

- Grupo **Anamnese** na barra lateral, depois de Financeiro, **só para o ADMIN**: Modelos de ficha (`/anamnese/modelos`) e Auditoria (`/anamnese/auditoria`).
- As fichas dos clientes não têm item no menu: ficam na aba "Anamnese" da página do cliente (etapa C), para o ADMIN e o profissional vinculado.

## Regras de privacidade no frontend (valem em todas as etapas)

> Destaque técnico: estas regras protegem o dado de saúde e não podem ser quebradas por conveniência.

- **Nada de dado de saúde** em `localStorage`, `sessionStorage`, cookies, URL (query ou caminho), logs ou mensagens de erro. Ids de ficha e de cliente na URL são aceitáveis; respostas e evolução, não.
- **Sem cache:** as chamadas de anamnese usam `cache: "no-store"` (o `apiFetch` já faz isso) e as páginas são dinâmicas; nada de `"use cache"` nem ISR nessas rotas.
- **Rascunho só em memória:** ao sair da tela, o que foi digitado é descartado.
- **Erros:** mostram o texto da API (já em português), nunca o conteúdo da ficha.
- Os registros são **imutáveis**: nenhuma tela oferece editar ou excluir ficha ou acompanhamento; corrige-se com um novo acompanhamento.
