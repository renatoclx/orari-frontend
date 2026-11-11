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

- Filtros na URL: busca por nome ou SKU, categoria, fornecedor e status;
  "Limpar filtros" com algum ativo. No celular ficam a busca e o status.
- Colunas: foto, nome e SKU; categoria; preço de venda (e o promocional
  abaixo); margem (negativa em vermelho); estoque atual; status.
- Ações: Alterar à vista; no menu, Visualizar (dialog com todos os dados),
  Inativar ou Reativar e Excluir (exclusão lógica; o SKU fica livre).

## Formulário (página)

- Foto no topo, como nas pessoas (enviada depois de salvar).
- Esquerda: nome*, categoria* (só ativas), SKU, unidade de medida (por
  extenso), fornecedor ("Sem fornecedor") e descrição. Categoria ou fornecedor
  inativados depois continuam no campo, marcados como inativos.
- Direita: Preços (venda*, custo*, promocional) com a prévia da margem sobre a
  venda; Estoque (atual*, mínimo, máximo), em números inteiros.
- Validação igual à da API; os erros dela (SKU, categoria, fornecedor,
  promocional, mínimo/máximo) aparecem no campo.

## Fora desta etapa

- Movimentação de estoque e alerta de estoque baixo.
- Venda de produto na comanda.
