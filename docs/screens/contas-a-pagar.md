# Contas a pagar

> Em construção (2026-11-10). Etapas: 1) renomear Pagamentos → Contas a
> receber e o relatório → Análise de recebíveis; 2) Fornecedores (ver
> `pessoas.md`); 3) **Categorias de despesa** (abaixo); 4) a tela de contas a
> pagar; 5) ligação com a comissão.

## Categorias de despesa

### Acesso

- Rota: `/financeiro/categorias-de-despesa`.
- Menu: grupo **Financeiro**, item "Categorias de despesa" (o último), só para
  o **ADMIN**; a API também recusa os demais.
- Funcionalidade em Acessos e limites: `expense-categories` ("Categorias de
  despesa", grupo Financeiro), com todas as ações; fora do modelo Agenda.

### Regras

- Mesmo cadastro dos métodos de pagamento (`metodos-pagamento.md`): só o nome,
  único entre as ativas (sem diferenciar maiúsculas e acentos); não se exclui,
  inativa-se e reativa-se.
- Toda empresa já começa com **Aluguel, Energia, Água, Internet e telefone,
  Produtos, Comissões, Salários, Impostos e Outros**, todas editáveis.

### Layout

- Igual ao de Métodos de pagamento: título, busca, **Nova categoria**, lista
  (Nome, Status, Ações: Alterar e Inativar; inativa só Reativar) e o dialog
  com o campo **Nome** ("Ex.: Aluguel").
