### Objetivo

Criar as telas correspondentes a cada entidades baseadas nas informações
descritas em skills.md e screen-patterns.md

## Login

### Campos

- E-mail
- Senha (com opção de mostrar/ocultar)

### Regras específicas

- Link "Esqueci minha senha" leva para a tela de Recuperação de Senha (implementação futura).
- Sem login social (Google ou outro OAuth - implementação futura).

---

## Recuperação de Senha

- Implementação futura.

---

# Sidebar

- No sidebar menu, a opção pessoas deverá contar com um dropdown contendo os tipos de pessoas
  que serão possíveis cadastrar. Sendo eles:
  - Clientes / Funcionários / Profissionais / Usuários
- Cada tipo de Pessoa irá referenciar um PeopleType no backend.
- Usuário é uma entidade separada, que possui referência diferente (UserType)

---

---

# Barra de ações lateral

- As informações por entidade a serem adicionadas estarão destacadas com `Barra de Ações`
- Menu de acesso rápido que está posicionado a direita, sobre o layout principal, apenas com ícones.
  - Calendário (irá ter ação com a tela de Agendamentos);
  - Cliente (ícone para cadastro rápido de um cliente);
  - Serviços (ícone para cadastro rápido de um serviço);

No celular, somente o item calendário será exibido, os demais devem permanecer ocultos.

---

# Clientes, Funcionários e Profissionais

## Listagem

### Colunas

- Nome
  - Será composto do Avatar com o nome;
- Celular (principal)
- CPF
- Data de Nascimento
- Profissão
- Status
- Ações

### Regras Específicas

- Status será baseado pelo deletedAt da entidade, não é um campo propriamente dito.

---

## Cadastro

### Campos

- Avatar (foto)
  - div circular para exibir a foto selecionada.
- Nome.
- Contato.
- Tipo do contato.
- E-mail.
- Documento.
- Data de Nascimento.
- Profissão.
- Observações.
- Contatos (Será um componente adicional no cadastro):
  - Tipo de Contato;
  - Telefone;
  - E-mail;
- Endereço (Será um componente adicional no cadastro):
  - Tipo;
  - CEP;
  - Rua;
  - Número;
  - Bairro;
  - Cidade (selecionável a partir de um estado escolhido em uma caixa de seleção);
  - O estado não é persistido na entidade;

### Ações

- Visualizar
- Alterar
- Excluir
- Reativar (caso o cliente esteja inativo)

### Regras Específicas

- Foto é opcional.
- Poderá adicionar uma foto ou tirar uma foto através do dispositivo.
- Adicionar máscara para campo celular: (##) #####-####.
- Adicionar máscara para campo de CPF: ###.###.###-##.
- Os registros serão inseridos na base sem as máscara.
- Nome obrigatório.
- Ao menos um contato (celular) obrigatório.
- Campo de E-mail opcional abaixo dos campos obrigatórios
- Contatos.
  - O cliente poderá ter mais de um contato cadastrado;
- Endereços.
  - O cliente poderá ter mais de um endereço cadastrado;
- Combobox para selecionar Estado.
  - Ao selecionar o Estado, habilita a seleção de Cidades (combobox), referente ao estado selecionado;

---

## Alteração

### Campos

- Avatar (foto)
  - div circular para exibir a foto selecionada.
- Nome.
- Contato.
- Tipo do contato.
- E-mail
- Documento.
- Data de Nascimento.
- Profissão.
- Observações.
- Contatos.
  - Trazer todos os contatos cadastrados
- Endereço.
  - Trazer todos os endereços cadastrados

### Regras Específicas

- Foto é opcional.
- Poderá adicionar uma foto ou tirar uma foto através do dispositivo.
- Adicionar máscara para campo celular: (##) #####-####.
- Adicionar máscara para campo de CPF: ###.###.###-##.
- Os registros serão inseridos na base sem as máscara.
- Campo de data de nascimento do tipo Date (Calendário).
- Nome obrigatório.
- Ao menos um contato (celular) obrigatório.
- Campo de E-mail opcional abaixo dos campos obrigatórios
- Contatos.
- Endereços.
- Combobox para selecionar Estado.
  - Ao selecionar o Estado, habilita a seleção de Cidades (combobox), referente ao estado selecionado;
- Um cliente cadastrado já está com status ativado por estar com o deletedAt como null.

---

## Exclusão

- Não permitir hard delete de clientes com histórico.
- As opções "Excluir" e "Alterar" devem ficar desabilitadas quando o
  cliente já estiver removido (`deletedAt` diferente de `null`).

---

## Layout do formulário

- O formulário é o componente principal da página: ocupa a largura toda e a
  altura que sobra, e fica dividido em duas colunas de mesma largura:
  - Antes da divisão das colunas, deve estar o campo de upload de foto centralizado, acima das colunas
  - Coluna 1 (dados principais): Nome; Contato e Tipo do contato (lado a
    lado); E-mail; Observações.
  - Coluna 2 (opcionais, em seções recolhíveis): Mais informações (aberta por
    padrão); Outros contatos; Endereços.
- No celular, as colunas ficam uma sobre a outra (coluna 1, depois coluna 2).
- Os botões Cancelar e Salvar ficam no rodapé do card, alinhados à direita,
  com a legenda "Campos obrigatórios" à esquerda.

### Mais Informações

- Campos CPF e Data de Nascimento lado a lado.

### Outros Contatos

- Ao clicar em adicionar contato
  - Mostrar campo contato com máscara de telefone.
  - Tipo de contato.
  - Botão Adicionar.

- Ao adicionar um novo contato, mostrar tabela com as informações
  - Contato
  - Tipo
  - Excluir, que deve ser um ícone de lixeira vermelho.

- Não deve ser permitido adicionar um contato vazio.
- A tabela deve ser posicionada abaixo dos campos cadastrais e do botão Adicionar.

### Endereços

- Ao clicar em adicionar endereço
  - Mostrar campos relativos ao cadastro de endereços
    - CEP
      - Buscará todos os dados que existem automaticamente via api externa.
      - Preencher os campos com as informações encontradas.
      - Os campos que vierem vazios serão preenchidos pelo cliente.
    - Rua
    - Número
    - Complemento
    - Bairro
    - Tipo de endereço
    - Campos de estado e cidade conforme descritos nas regras
    - Botão Adicionar.

- Número, Complemento e Bairro na mesma linha.
- Tipo de endereço, Estado e Cidade na mesma linha.

- Ao adicionar um novo endereço, mostrar tabela com as informações
  - Logradouro
  - Tipo
  - Excluir, que deve ser um ícone de lixeira vermelho.

- Não deve ser permitido adicionar um endereço vazio.
- A tabela deve ser posicionada abaixo dos campos cadastrais e do botão Adicionar.

---

## Barra de Ações

- Cadastro rápido de um cliente
- Ao clicar para adicionar um cliente no cadastro rápido:
  - Mostrar dialog apenas com nome e telefone.
  - Os dados posteriores poderão ser adicionados após o cadastro rápido.

---

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

### Regras específicas

- Nome obrigatório.
- Duração obrigatória.
- Descrição opcional.
- Preço opcional.
  - Utilizar máscara para R$ padrão BRL
- Cor opcional.
  - Utilizar campo colorPicker
- A duração do serviço é informada em minutos.
- O serviço será cadastrado sempre como ativo.

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

---

## Barra de Ações

- Cadastro rápido de um serviço
- Ao clicar para adicionar um serviço no cadastro rápido:
  - Mostrar o dialog de cadastro de serviços.
  - Executar ações conforme padrão do cadastro.

---

---

# Agendamentos

> Primeira entrega: **somente leitura**. Cadastro, remarcação, cancelamento e alteração de status serão especificados nas próximas etapas.

## Visualização do dia

### Estrutura da tela

- Título: "Agendamentos".
- Barra superior:
  - Botões "Dia anterior", "Próximo dia" e "Hoje".
  - Data por extenso do dia exibido.
  - Botão "Novo Agendamento", sempre visível (a ação será implementada em etapa futura).
- Grade do dia, que ocupa a largura e a altura da página, com rolagem própria:
  - Uma coluna por profissional ativo, com o nome e a quantidade de agendamentos do dia (cancelados não contam).
  - Coluna de horários fixa à esquerda, em intervalos de 30 minutos.
  - Linha do horário atual, somente quando o dia exibido é hoje.
  - Áreas fora do horário de funcionamento da empresa sombreadas.

### Bloco de agendamento

- Posicionado pelo horário de início e pela duração do serviço.
- Cor do serviço na borda esquerda e como fundo suave.
- Exibe horário de início, nome do cliente e nome do serviço.
- Por status:
  - Agendado: padrão.
  - Confirmado: ícone de check.
  - Em andamento: ponto pulsante na cor do serviço.
  - Concluído: esmaecido.
  - Cancelado: esmaecido e nome do cliente riscado.
  - Não compareceu: esmaecido, com ícone de ausência.
- Ao passar o mouse, exibe "Cliente, Serviço (Status)".

### Regras específicas

- O dia é calculado no fuso da empresa (a API trabalha em UTC).
- Apenas profissionais ativos são exibidos. A agenda de um profissional inativo será remanejada (fora do MVP).
- Agendamentos cancelados permanecem na grade, esmaecidos.
- O intervalo exibido vai da abertura mais cedo do dia, menos 2 horas, ao fechamento mais tarde, mais 2 horas. Agendamentos fora desse intervalo ampliam a grade. Sem horário de funcionamento no dia, a grade exibe das 07:00 às 20:00.
- Não há pausas por profissional nesta versão (previsão futura: o administrador poderá lançar pausas).
- Dia sem agendamentos: grade vazia. Sem profissionais cadastrados: mensagem orientando o cadastro.

### Navegação

- O dia exibido fica na URL (`?date=aaaa-mm-dd`); sem ele, exibe hoje.
- O calendário do atalho da barra lateral leva ao dia escolhido.

### Celular

- Exibe um profissional por vez, com seleção do profissional no topo.

---
