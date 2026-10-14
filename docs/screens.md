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

---

# Clientes

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

- Quando não existir a informação, preencher com "--";
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

deverão ser respeitados.

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
