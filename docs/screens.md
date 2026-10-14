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

> Esta entrega cobre a visualização do dia. O cadastro, a alteração e a mudança de status de agendamentos serão especificados nas próximas etapas (os dialogs existem como rascunho visual e ainda não gravam).

## Visualização do dia

### Estrutura da tela

- Título: "Agendamentos".
- Barra superior:
  - Botões "Dia anterior", "Próximo dia" e "Hoje".
  - Data por extenso do dia exibido.
  - Filtro "Filtrar por profissional" (apenas no computador) e, quando há filtro, o botão "Mostrar Todos".
  - Botão "Encaixar horário", neutro, para agendar fora do horário de funcionamento (ver "Encaixe").
  - Botão "Novo Agendamento", sempre visível.
- Grade do dia, que ocupa a largura e a altura da página, com rolagem própria:
  - Uma coluna por profissional exibido (ver "Profissionais exibidos"), com o nome e a quantidade de agendamentos do dia (cancelados não contam).
  - Coluna de horários fixa à esquerda, em intervalos de 30 minutos.
  - Linha do horário atual, somente quando o dia exibido é hoje.
  - Áreas fora do expediente (antes da abertura e depois do fechamento) sombreadas, com hachura.
  - O intervalo entre janelas de atendimento (horário de almoço, por exemplo) em cinza, com a indicação "Intervalo".
- Legenda dos ícones de status e do encaixe no rodapé da página, alinhada à direita.

### Profissionais exibidos

- Ao carregar, a grade exibe os profissionais ativos que têm agendamentos no dia. Agendamentos cancelados não contam.
- Dia sem nenhum agendamento: exibe todos os profissionais ativos.
- Filtro por profissional: exibe somente o profissional escolhido.
  - Um profissional sem agendamentos aparece com a coluna vazia, e o usuário é notificado de que ele não possui agendamentos no dia.
  - Um profissional que só tem agendamentos cancelados também pode ser filtrado e exibe a sua grade.
- Botão "Mostrar Todos": volta à exibição padrão (profissionais com agendamentos).
- Profissional inativo permanece fora da grade (a agenda dele será remanejada, fora do MVP).

### Encaixe (agendamento fora do horário de funcionamento)

- Acionado de duas formas: pelo botão "Encaixar horário" ou clicando em uma área sombreada fora do expediente (antes da abertura ou depois do fechamento) da grade.
- Abre o dialog de novo agendamento com um aviso fixo de que o agendamento é fora do horário de funcionamento.
- O expediente do dia vai da abertura mais cedo ao fechamento mais tarde. Intervalos entre janelas de atendimento (almoço, por exemplo) fazem parte do expediente: não aceitam agendamento nem encaixe, e o clique exibe um aviso.
- O seletor de horário do dialog oferece apenas horários que estão de fato fora do expediente (antes da abertura ou depois do fechamento), que ainda não passaram e que não sobrepõem outro agendamento do profissional. Horários do intervalo entre janelas e dentro do expediente não aparecem.
- A duração do serviço escolhido é considerada: o atendimento inteiro precisa caber fora do expediente.
- Ao clicar em uma área sombreada, o profissional e o horário clicados já vêm preenchidos.
- Não há recorrência de encaixe; apenas agendamentos básicos.
- O encaixe é exibido com uma cor cinza exclusiva e identificado como encaixe.
- Horário que já passou, na área livre ou sombreada, não aceita agendamento: o clique exibe um aviso.

### Bloco de agendamento

- Posicionado pelo horário de início e pela duração do serviço.
- Cor do serviço na borda esquerda e como fundo suave. O encaixe usa o cinza exclusivo.
- Exibe horário de início, nome do cliente e nome do serviço.
- Cada status tem um ícone no canto do bloco:
  - Agendado: relógio.
  - Confirmado: check em círculo.
  - Em andamento: play em círculo, pulsando, na cor do serviço.
  - Concluído: duplo check. Bloco esmaecido.
  - Cancelado: X em círculo. Bloco esmaecido e nome do cliente riscado.
  - Não compareceu: usuário com X. Bloco esmaecido.
- Ao passar o mouse, um cartão exibe: foto e nome do cliente, serviço com cor e duração, horário, profissional, status, observação (quando houver) e a indicação de encaixe.
- Ao clicar, abre o dialog de detalhes do agendamento (rascunho visual, sem gravação).

### Regras específicas

- O dia é calculado no fuso da empresa (a API trabalha em UTC).
- Agendamentos cancelados permanecem na grade, esmaecidos, para os profissionais exibidos.
- O intervalo exibido vai da abertura mais cedo do dia, menos 2 horas, ao fechamento mais tarde, mais 2 horas. Agendamentos fora desse intervalo ampliam a grade. Sem horário de funcionamento no dia, a grade exibe das 07:00 às 20:00.
- Não há pausas por profissional nesta versão (previsão futura: o administrador poderá lançar pausas).
- Sem profissionais cadastrados: mensagem orientando o cadastro.
- Horários livres dentro do expediente abrem o novo agendamento com profissional e horário preenchidos. Horários ocupados abrem os detalhes do agendamento.

### Navegação

- O dia exibido fica na URL (`?date=aaaa-mm-dd`); sem ele, exibe hoje.
- O calendário do atalho da barra lateral leva ao dia escolhido.

### Celular

- Exibe um profissional por vez. A troca é feita por um ícone de seleção ao lado do nome do profissional, no cabeçalho da coluna.
- O filtro por profissional e o botão "Mostrar Todos" não existem no celular.

### Pendências (previstas)

- Backend: aceitar agendamento fora do horário de funcionamento e guardá-lo como overbooking (flag opcional) para diferenciá-lo dos demais. Previsto para sexta-feira.
- Cadastro, alteração, confirmação e cancelamento de agendamentos.
- Regras das transições de status.

---
