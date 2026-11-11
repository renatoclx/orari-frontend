# Contas a pagar

## Objetivo

Lançar e pagar as despesas da empresa: o que vence, o que atrasou e o que já
foi pago.

## Acesso

- Rota `/financeiro/contas-a-pagar`. Menu **Financeiro**, logo abaixo de
  Contas a receber. Só o **ADMIN**.
- Funcionalidade `payables` ("Contas a pagar") com as quatro ações: Pagar e
  Alterar = Edita; Cancelar e Excluir = Exclui.

## Regras

- Favorecido opcional: fornecedor ou profissional ativo. O fornecedor
  preenche a categoria com a sua categoria principal.
- Repetição: **Parcelar** (o valor é dividido e a última parcela leva os
  centavos) ou **Repetir por N meses** (o mesmo valor), de 2 a 60 vezes, uma
  conta por mês.
- **Já está paga**: só sem repetição, com método e data do pagamento (não
  futura).
- Só a conta pendente pode ser alterada, paga ou cancelada. Para pagar um
  valor diferente, altere o valor antes de pagar. Cancelar e alterar valem só
  para a conta, não para as outras da repetição.
- Excluir: para lançamento errado, pendente ou cancelado. A conta paga não
  pode ser excluída.

## Layout

- Cabeçalho com "Nova conta a pagar". Cartões **Atrasado**, **A vencer** e
  **Pago**, que filtram a lista.
- Filtros na URL: situação (padrão: Pendentes), vencimento de/até, favorecido
  e categoria.
- Lista com seleção das pendentes, a barra "N selecionadas · total" e o botão
  "Pagar selecionadas". Por conta: **Pagar**, Alterar e ⋮ (Cancelar,
  Excluir). "Pago em" mostra a data e, abaixo, o método. No celular, cartões.

## Comissões

- **Comissões em aberto**: bloco acima da tabela, uma linha por profissional
  (comissão, adiantado, **a pagar** e **Fechar comissão**, que abre o diálogo
  da tela Comissões). Não é conta: não tem vencimento e se quita pelo
  fechamento. Aparece com a funcionalidade Comissões, na situação Pendentes, A
  vencer ou Todas, sem filtro de vencimento e com a categoria Todas ou
  Comissões.
- O cartão **A vencer** soma as comissões em aberto ("7 contas + R$ X de
  comissões").
- **Contas geradas**: o fechamento ("Comissão nº 0001", pelo valor pago; zero
  não gera) e o adiantamento ("Adiantamento de comissão") viram contas pagas
  na categoria Comissões, com o profissional como favorecido. São protegidas:
  em Ações, "Ver recibo" (`Eye`, só a do fechamento) e "Via Comissões"; mudam
  só pela tela Comissões (desfazer o fechamento cancela a conta; excluir o
  adiantamento a apaga).
- Sem a categoria "Comissões" ativa (renomeada ou inativada), ela é criada de
  novo.

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
