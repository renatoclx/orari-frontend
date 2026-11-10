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

## Fora desta etapa

- Comissões em aberto como linha calculada e a conta gerada pelo fechamento
  (etapa 5).
