# Serviços

## Listagem

### Colunas

- Nome
- Preço
- Duração (mostrar em minutos. Ex: 60 minutos)
- Status (corresponde ao isActive)
- Cor (exibir um pequeno circulo 16x16 sem bordas com a cor do serviço).
- Ações
  - Visualizar
  - Alterar.
  - Inativar.
  - Excluir.

### Regras específicas

- O status é controlado pelo isActive.

---

## Cadastro

### Campos

- Nome
- Descrição
- Preço
- Duração
- Cor (que será exibida no agendamento)
- Aceita turma

### Regras específicas

- Nome obrigatório.
- Duração obrigatória.
- Descrição opcional.
- Preço opcional.
  - Utilizar máscara para R$ padrão BRL
- Cor opcional.
  - Simplificar a escolha da cor com cores pré-definidas, com circulos, sem bordas.
- A duração do serviço é informada em minutos.
- O serviço será cadastrado sempre como ativo.
- Aceita turma é opcional (desligado por padrão) e libera o serviço no cadastro de
  turmas (`turmas.md`). Desmarcar com turma ativa é recusado pela API (a mensagem
  aparece no toast).

---

## Alteração

- A alteração seguirá os mesmos padrões do cadastramento.

---

## Inativação e Exclusão.

- A inativação reflete o campo isActive.
- A exclusão só poderá ser feita caso o serviço não tenha nenhum tipo de relacionamento criado.
- Dialogs separados para exclusão e inativação.

---

## Layout do Formulário

- Ao clicar em Novo Serviço, usar dialog para realizar as operações de inclusão e alteração
  Nome;
  Descrição;
  Duração - Preço;
  Cor;
  Aceita turma;

---

## Barra de Ações

- Cadastro rápido de um serviço
- Ao clicar para adicionar um serviço no cadastro rápido:
  - Mostrar o dialog de cadastro de serviços.
  - Executar ações conforme padrão do cadastro.
