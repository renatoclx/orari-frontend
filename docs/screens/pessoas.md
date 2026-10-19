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
- Filtro de status (Todos, Ativos, Inativos) ao lado da busca, na URL (`?status=`), como nas demais listagens; a busca mantém o filtro e o filtro mantém a busca.

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

## Histórico do cliente

> Reúne, em um só lugar, tudo o que o cliente tem com a empresa: agendamentos,
> recorrências, pacotes e pagamentos. Só para **clientes** (funcionários e
> profissionais não têm histórico).

### Acesso

- Página própria: `/clientes/[id]` (não é dialog: o histórico cresce e precisa de abas e paginação).
- Na listagem de clientes, botão **Histórico** à vista na coluna Ações, ao lado de "Alterar" (ícone de histórico). O "Visualizar" (dialog com os dados cadastrais) sai do menu de clientes, porque o cabeçalho do histórico já mostra esses dados. Funcionários e profissionais continuam como estão.
- Os atalhos dentro do histórico (sessões e contratação) abrem em dialog.

### Cabeçalho

- Avatar, nome, contato principal, e-mail e status; botão **Alterar** (abre a alteração).
- Resumo (cartões pequenos), montado com os filtros que a API já tem:
  - Próximo agendamento (data, horário, serviço): agendamentos do cliente a partir de agora, com status Agendado, o primeiro;
  - Atendimentos concluídos: total de agendamentos com status Concluído;
  - Pacotes ativos: total de contratações com status ativo;
  - Cancelamentos: total de agendamentos com status Cancelado;
  - Faltas: total de agendamentos com status Não compareceu.

### Abas

1. **Agendamentos** — `GET /appointments?clientId=`
   - Colunas: data, horário, serviço, profissional, status (ícone da agenda) e origem (ícone de recorrência ou de pacote).
   - Filtros: **Próximos** (padrão, do mais próximo para o mais distante), **Anteriores** (do mais recente para o mais antigo, `order=desc`), **Cancelados** e **Não compareceu** (todas as datas, só aquele status, do mais recente para o mais antigo). Próximos e Anteriores mostram todos os status.
   - Ações: as mesmas do detalhe da agenda (cancelar, remanejar, ver sessões, ver contratação), em dialog.
2. **Recorrências** — `GET /recurring-appointments?clientId=`
   - Colunas como na lista de recorrências (profissional, serviço, dias, período, status).
   - Ação: **Ver sessões** (dialog de sessões).
3. **Pacotes** — `GET /client-plans?clientId=`
   - Colunas como na lista de contratações (plano, período, modalidade, total, status).
   - Ação: **Ver contratação** (dialog da contratação).
4. **Pagamentos** — `GET /payments?clientId=` (avulsos e parcelas de pacote)
   - Colunas: vencimento, descrição (atendimento: data e serviço; parcela: nome do plano), valor e situação (Pendente, Atrasado, Pago, Cancelado).
   - Só leitura por enquanto; a baixa entra com o Financeiro e passa a valer aqui também.

### Regras específicas

- Cada aba busca os próprios dados ao ser aberta, com paginação.
- Cliente inativo: o histórico continua visível (é a razão de não haver exclusão definitiva), só para consulta: o cabeçalho não tem "Alterar" e as ações dos agendamentos ficam ocultas. A alteração do inativo, aberta pela URL, responde "não encontrado".

### Backend (feito)

- `GET /appointments` aceita `order=desc` (o mais recente primeiro), para "Anteriores".
- `GET /payments` traz a origem de cada pagamento: `appointment` (data e serviço) ou `clientPlan` (nome do plano).
- `GET /people/:id` devolve também a pessoa inativa, só para leitura (alterar e excluir continuam só para ativas).
