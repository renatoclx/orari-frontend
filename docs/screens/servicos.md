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
- Aceita turma (só com a funcionalidade Turmas liberada)
- **Comissão do profissional** (só o ADMIN vê e define, e só com a funcionalidade Comissões liberada)
- **Profissionais que atendem** (caixas de seleção com os profissionais ativos; busca ao abrir o formulário). O serviço aparece no **portal do cliente** quando tem ao menos um profissional. A lista é gravada depois do serviço, pela rota própria (`PUT /services/:id/professionals`); se a busca falhar, nada é apagado. Se só a lista falhar, o aviso diz que o serviço foi salvo e os profissionais não.

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
  aparece no toast). Só aparece com a funcionalidade Turmas liberada para a
  empresa (também no Visualizar); sem ela, salvar não muda o valor gravado.
- Comissão do profissional (2026-11-10): `Select` com **Sem comissão** (padrão),
  **Percentual** (campo "Percentual (%)", de 0,01 a 100, aceita vírgula) ou
  **Valor fixo** (campo "Valor por atendimento", máscara R$). O campo de valor
  muda com o tipo e é obrigatório quando há tipo; o erro aparece no campo.
  Só o ADMIN de uma empresa com Comissões liberada vê o bloco (a API recusa e
  esconde para os demais); sem ele, salvar não muda a comissão gravada. O atalho
  "Novo serviço" da barra de ações não tem o campo: a comissão é definida ao
  alterar o serviço. Vale para os atendimentos concluídos daí em diante.

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
  Comissão do profissional - Percentual ou Valor por atendimento (só ADMIN);
  Profissionais que atendem;

---

## Barra de Ações

- Cadastro rápido de um serviço
- Ao clicar para adicionar um serviço no cadastro rápido:
  - Mostrar o dialog de cadastro de serviços.
  - Executar ações conforme padrão do cadastro.
