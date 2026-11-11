# Produtos

## Objetivo

Cadastro dos produtos que a clínica vende, com preços, margem e estoque, e das
categorias que os agrupam.

## Acesso

- Rotas: `/produtos`, `/produtos/novo`, `/produtos/[id]/editar` e
  `/produtos/categorias`.
- Menu: grupo **Produtos** (ícone `ShoppingBag`), logo abaixo de Serviços, com
  Produtos e Categorias. Só o **ADMIN**; a API recusa os demais.
- Funcionalidades em Acessos e limites: `product-categories` ("Categorias de
  produto") e `products` ("Produtos"), com as quatro ações; fora de todos os
  modelos (o SUPER_ADMIN libera). A API exige ver as categorias para ver os
  produtos.

## Categorias

- Lista paginada com busca por nome e o filtro de status (Todas, Ativas,
  Inativas).
- Nova categoria e Alterar em dialog (só o nome; repetido aparece no campo).
- Sem exclusão: Inativar (com confirmação) e Reativar. Com produtos ativos, a
  inativação é recusada e o aviso explica.

## Lista de produtos

- "Novo produto" ao lado do título (como em Contas a pagar), para os filtros
  caberem numa linha.
- Filtros na URL: busca por nome ou SKU, categoria, fornecedor, status e o
  botão liga e desliga **Estoque baixo** (`?estoque=baixo`); "Limpar filtros"
  com algum ativo. No celular somem categoria e fornecedor.
- Colunas: foto, nome e SKU; categoria; preço de venda (e o promocional
  abaixo); margem (negativa em vermelho); estoque atual, com o selo vermelho
  "Estoque baixo" abaixo do mínimo; status.
- Ações: Alterar e **Movimentar estoque** à vista; no menu, Visualizar (dialog
  com todos os dados), **Histórico de estoque**, Inativar ou Reativar e
  Excluir (exclusão lógica; o SKU fica livre).

## Formulário (página)

- Foto no topo, como nas pessoas (enviada depois de salvar).
- Esquerda: nome*, categoria* (só ativas), SKU, unidade de medida (por
  extenso), fornecedor ("Sem fornecedor") e descrição. Categoria ou fornecedor
  inativados depois continuam no campo, marcados como inativos.
- Direita: Preços (venda*, custo*, promocional) com a prévia da margem sobre a
  venda; Estoque (atual*, mínimo, máximo), em números inteiros. O atual só é
  informado no cadastro (saldo inicial); na alteração, é só leitura.
- Validação igual à da API; os erros dela (SKU, categoria, fornecedor,
  promocional, mínimo/máximo) aparecem no campo.

## Estoque

- **Movimentar estoque** (dialog): entrada por compra, uso interno, perda ou
  ajuste de inventário (o saldo contado), com a prévia "atual → novo", o
  total da compra e a observação. Saída maior que o estoque e ajuste igual ao
  saldo são barrados no campo.
- **Compra:** o custo vem com o atual e passa a ser o preço de custo. "Lançar
  conta a pagar" só aparece com o Contas a pagar no plano: favorecido = o
  fornecedor do produto, categoria = a principal dele, vencimento começando
  em hoje e "Já está paga" com método e data.
- **Histórico de estoque** (dialog): do mais recente ao mais antigo, com o
  tipo, a data e quem lançou, a variação e o saldo, o custo, a conta e a
  observação; "Carregar mais".

## Venda

A venda é feita na comanda (ver `financeiro.md`, "Venda de produtos"): tira os
produtos do estoque ao lançar (movimentação "Venda"), e cancelar a venda
pendente devolve (movimentação "Venda cancelada"); as duas aparecem no
Histórico de estoque.
