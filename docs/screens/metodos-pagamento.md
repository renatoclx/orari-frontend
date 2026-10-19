# Métodos de Pagamento

## Listagem

### Colunas

- Nome
- Status
- Ações (à vista, sem menu: são poucas)
  - Editar
  - Inativar
  - Reativar (só nos inativos, no lugar das outras)

### Regras específicas

- O status é controlado pelo deletedAt. A listagem traz ativos e inativos, em ordem alfabética, com busca por nome e paginação.
- Rota: `/financeiro/metodos-de-pagamento` (menu Financeiro).

---

## Cadastro

### Campos

- Tipo de Pagamento (obrigatório; é o nome do método, ex.: Pix, Cartão de crédito)

### Regras específicas

- O nome é único entre os métodos ativos da empresa, sem diferenciar maiúsculas nem acentos ("PIX" e "Pix" são o mesmo). Repetido: o servidor responde no campo.

---

## Inativação

- A inativação reflete o campo deletedAt, com confirmação. O método inativo deixa de aparecer nas baixas de pagamento; os pagamentos já recebidos com ele não mudam.

## Reativação

- Limpa o deletedAt. Se o nome estiver em uso por outro método ativo, a API recusa e a tela mostra o motivo.

---

### Layout do dialog

- Ao clicar em Novo método de pagamento, usar o dialog para realizar a operação. A alteração usa o mesmo dialog.
