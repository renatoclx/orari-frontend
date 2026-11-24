Contexto: o backend do Orari ganhou o cadastro de **categorias de produto** e de **produtos** (branch `feature/produtos`, commit `173fa40`). As regras completas estão em `backend/docs/business-rules/categorias-produtos.md` e as entidades em `backend/docs/domain/categorias-produtos.md`. Leia os dois antes de começar.

Siga o fluxo do CLAUDE.md: analise, proponha o plano e aguarde aprovação. Implemente só o básico descrito aqui.

## O que fazer

1. **Acessos (tela do SUPER_ADMIN):** acrescentar as funcionalidades `product-categories` ("Categorias de produto") e `products` ("Produtos") em `src/components/companies/company-access.ts`, com as quatro ações. `products` exige visualizar `product-categories`. As duas não vêm liberadas no modelo padrão.
2. **Categorias de produto:** listagem paginada com busca por nome e filtro de situação; criar; renomear; inativar e reativar. Use como referência a tela de categorias de despesa (`src/app/(admin)/financeiro/categorias-de-despesa`, `src/components/expense-categories/`).
3. **Produtos:** listagem paginada com busca (nome ou SKU), filtros por categoria, fornecedor e situação; formulário de cadastro e edição; inativar e reativar; excluir; enviar e remover a foto (a mesma experiência da foto das pessoas).
4. **Menu:** as duas telas, ligadas às funcionalidades `product-categories` e `products` (como o item de categorias de despesa no `Sidebar.tsx`). Proponha onde ficam no menu.

Só o **ADMIN** acessa. Os demais perfis recebem 403.

## Contrato da API

### Categorias de produto

| Rota                            | Corpo / consulta                | Resposta                        |
| ------------------------------- | ------------------------------- | ------------------------------- |
| `GET /product-categories`       | `?name=&isActive=&page=&limit=` | `{ items, total, page, limit }` |
| `GET /product-categories/:id`   |                                 | categoria                       |
| `POST /product-categories`      | `{ name }`                      | 201, categoria                  |
| `PATCH /product-categories/:id` | `{ name?, isActive? }`          | categoria                       |

Categoria: `{ id, companyId, name, isActive, createdAt, updatedAt }`. Não há exclusão: inativar e reativar é o `PATCH` com `isActive`. A listagem vem em ordem de nome; sem `isActive`, traz ativas e inativas.

### Produtos

| Rota                         | Corpo / consulta                                          | Resposta                        |
| ---------------------------- | --------------------------------------------------------- | ------------------------------- |
| `GET /products`              | `?search=&categoryId=&supplierId=&isActive=&page=&limit=` | `{ items, total, page, limit }` |
| `GET /products/:id`          |                                                           | produto                         |
| `POST /products`             | ver abaixo                                                | 201, produto                    |
| `PATCH /products/:id`        | os mesmos campos, todos opcionais                         | produto                         |
| `DELETE /products/:id`       |                                                           | 204 (exclusão lógica)           |
| `POST /products/:id/photo`   | multipart, campo `photo` (JPEG ou PNG, até 2 MB)          | 201, produto                    |
| `DELETE /products/:id/photo` |                                                           | 204                             |

Cadastro:

```json
{
  "name": "Óleo de massagem",
  "description": "opcional",
  "sku": "OL-01",
  "categoryId": "uuid",
  "supplierId": "uuid",
  "measureUnit": "ML",
  "salePrice": 100,
  "purchasePrice": 60,
  "promotionalPrice": 90,
  "currentStock": 10,
  "minimalStock": 2,
  "maximumStock": 50,
  "isActive": true
}
```

- Obrigatórios: `name`, `categoryId`, `salePrice`, `purchasePrice`, `currentStock`.
- Na edição, `null` limpa `description`, `sku`, `supplierId`, `measureUnit`, `promotionalPrice`, `minimalStock` e `maximumStock`. Nos campos obrigatórios, `null` é recusado (400).
- **Não envie `profitMargin`**: a API calcula e devolve (400 se vier no corpo).

Produto (resposta): todos os campos acima, mais `id`, `companyId`, `photoUrl`, `profitMargin`, `createdAt`, `updatedAt`, `deletedAt`, `category: { id, name }` e `supplier: { id, name } | null`.

- **Preços e margem chegam como texto** (ex.: `"100"`, `"40"`, `"37.5"`), como os outros valores decimais da API. Formate como moeda e percentual.
- **Unidades de medida:** `UN` (unidade), `CX` (caixa), `PCT` (pacote), `KG`, `G`, `L`, `ML` e `M`. Use uma lista de opções com os nomes por extenso.
- **Margem:** sobre o preço de venda, `(venda − custo) ÷ venda × 100`. Pode ser **negativa** (custo acima da venda): vale destacar. Mostrar uma prévia no formulário, enquanto o usuário digita, ajuda; o valor que vale é o que a API devolve.

### Para os campos de escolha

- **Categoria:** `GET /product-categories?isActive=true` (produto não entra em categoria inativa).
- **Fornecedor:** a listagem de pessoas com `type=SUPPLIER` (opcional; mostrar "Sem fornecedor").

## Regras que a tela precisa respeitar (e mensagens da API)

| Situação                                                        | Resposta                                                                                                  |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Nome de categoria repetido (sem diferenciar acento e maiúscula) | 409 "Já existe uma categoria de produto com este nome na empresa"                                         |
| Inativar categoria com produtos ativos                          | 409 "A categoria tem produtos ativos. Inative os produtos ou mude a categoria deles antes de inativá-la." |
| Criar, mover ou reativar produto em categoria inativa           | 400 "A categoria de produto está inativa"                                                                 |
| SKU repetido (entre os não excluídos)                           | 409 "Já existe um produto com este SKU na empresa"                                                        |
| Promocional igual ou acima da venda                             | 400 "O preço promocional precisa ser menor que o preço de venda"                                          |
| Estoque mínimo acima do máximo                                  | 400 "O estoque mínimo não pode passar do estoque máximo"                                                  |
| Fornecedor que não é `SUPPLIER` ativo                           | 400 "O fornecedor precisa ser uma pessoa ativa do tipo SUPPLIER"                                          |
| Foto que não é JPEG nem PNG                                     | 400 "A foto deve ser uma imagem JPEG ou PNG"                                                              |
| Funcionalidade não liberada na empresa                          | 403 "Esta funcionalidade não está disponível para a sua empresa"                                          |

Validações do formulário (iguais às do backend): preços maiores que zero, com até duas casas; estoques inteiros, 0 ou mais; promocional menor que a venda; mínimo até o máximo.

## Ambiente local

- O Studio Aurora (`studio-aurora-demo`) já tem `products` e `product-categories` liberadas no banco local.
- A migration `20261111120000_products` já foi aplicada no banco local. Reinicie o backend se ele estava rodando antes do commit.
