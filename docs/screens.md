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

> Esta entrega cobre a visualização do dia, o novo agendamento, o encaixe e o cancelamento. A alteração (remarcar e editar) será especificada nas próximas etapas.

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
  - Áreas fora das janelas de atendimento (antes da abertura e depois do fechamento) sombreadas, com hachura.
  - O intervalo entre duas janelas de atendimento (almoço, por exemplo) em cinza, com a indicação "Intervalo". É apenas indicação visual: não tem regra própria.
- Legenda dos ícones de status e do encaixe no rodapé da página, alinhada à direita.

### Profissionais exibidos

- Ao carregar, a grade exibe todos os profissionais ativos cadastrados, com ou sem agendamentos no dia.
- Filtro por profissional: exibe somente o profissional escolhido. O filtro fica na URL (`?professional=`) e acompanha a troca de dia e o calendário.
  - Um profissional sem agendamentos aparece com a coluna vazia, e o usuário é notificado de que ele não possui agendamentos no dia.
  - Um profissional que só tem agendamentos cancelados exibe a sua grade normalmente.
- Botão "Mostrar Todos": sempre visível; volta a exibir todos os profissionais ativos (desabilitado quando já estão todos).
- Profissional inativo permanece fora da grade (a agenda dele será remanejada, fora do MVP).

### Encaixe (agendamento fora do horário de funcionamento)

- Acionado de duas formas: pelo botão "Encaixar horário" ou clicando em uma área sombreada (fora das janelas de atendimento, inclusive o intervalo entre janelas) da grade. Os dois abrem o dialog de "Encaixar agendamento" (ver a seção própria).
- O expediente do dia são as janelas de atendimento cadastradas. Fora do expediente é tudo que não está dentro de uma janela: antes da abertura, depois do fechamento, dias sem janela e o intervalo entre duas janelas.
- Ao clicar em uma área sombreada, o profissional e o horário clicados já vêm preenchidos.
- O encaixe é exibido com uma cor cinza exclusiva e identificado como encaixe (o backend guarda o agendamento como `overBooking`).
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
- Ao clicar, abre o dialog de detalhes do agendamento (ver "Detalhes do agendamento").

### Regras específicas

- O dia é calculado no fuso da empresa (a API trabalha em UTC).
- Agendamentos cancelados permanecem na grade, esmaecidos, para os profissionais exibidos. Quando outro agendamento passa a ocupar o mesmo horário (o horário liberado foi reaproveitado), o cancelado deixa de ser exibido para não ficar sobreposto. Vários cancelados no mesmo horário aparecem como um só.
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

- Confirmação do agendamento pelo cliente (status Confirmado).
- Empresa sem nenhuma janela de atendimento cadastrada: a API não restringe horários nem há encaixe; a agenda ainda trata o dia sem janela como "somente encaixe".
- Regra no backend para não cancelar agendamento que já iniciou (hoje só a tela impede).

---

## Detalhes do agendamento

- Exibe foto e nome do cliente, serviço com cor e duração, horário, profissional, status, indicação de encaixe e observação.
- A única ação de status é **Cancelar agendamento**:
  - Botão vermelho, centralizado, exibido apenas enquanto o agendamento ainda não iniciou (status Agendado ou Confirmado, com o horário de início no futuro).
  - Pede confirmação em dialog ("Cancelar agendamento?", com "Voltar" e "Cancelar agendamento"). Ao confirmar, o status passa a Cancelado, o horário fica livre e um aviso informa o cancelamento.
  - Agendamento gerado por recorrência é cancelado pela própria recorrência; se a API recusar, o motivo é exibido.
- Não há ação manual para os demais status: o início e a conclusão do atendimento são automáticos, pelo horário (o backend atualiza o status), e a confirmação (status Confirmado) será feita pelo cliente em uma funcionalidade futura. "Não compareceu" ainda não tem regra no backend.
- O botão "Alterar" abre o dialog de alteração (ver "Alterar agendamento"). Aparece apenas enquanto o agendamento ainda não iniciou, como o cancelamento: nada no passado é alterado.

---

## Novo Agendamento

### Estrutura do dialog

- Campo de seleção com busca de Cliente.
- Campo de seleção com busca de Serviço.
- Campo de seleção de Profissional.
- Campo de calendário para a Data.
- Horários selecionáveis, com caixa de seleção do período.
- Campo Observações para anotações.

### Regras específicas

- A data do agendamento não pode ser anterior ao dia de hoje. Hoje, só são oferecidos horários que ainda não passaram.
- Ao abrir pelo clique em um horário vazio da agenda, o profissional e a data vêm preenchidos. O horário clicado fica como "desejado": é marcado automaticamente quando o serviço é escolhido, se ainda estiver disponível.
- Ao selecionar o serviço:
  - Os horários surgem apenas com os disponíveis para realizar o serviço, de acordo com a duração dele, para o profissional e a data escolhidos.
  - O cálculo do horário final é baseado na duração do serviço em relação ao horário selecionado ("Término previsto").
  - Os horários de início são os de uma grade de 15 em 15 minutos mais o horário logo após o fim de cada agendamento do profissional. Assim, se um serviço deixa um horário "quebrado" (ex.: serviço de 40 minutos termina às 10:40 e sobram 20 minutos até as 11:00), um serviço mais curto pode ser agendado ali.
  - Os horários representam apenas o horário de trabalho: o atendimento precisa caber inteiro em uma janela de atendimento. Horários de encaixe não aparecem (no encaixe esta regra se inverte; ver "Encaixar agendamento").
  - Não aparecem horários que sobreponham outro agendamento do profissional. Agendamentos cancelados liberam o horário.
- Os horários ficam agrupados por período, em uma caixa de seleção, para não sobrecarregar o dialog:
  - Manhã (até 11:59), Tarde (de 12:00 a 17:59) e Noite (a partir das 18:00).
  - A caixa de seleção só mostra os períodos que possuem horários disponíveis, com a quantidade de horários de cada um.
  - Escolhido o período, os horários dele são exibidos como botões selecionáveis.
- Sem serviço escolhido, o campo de horário orienta a escolher o serviço. Sem horários disponíveis, informa que não há horários no dia, sugerindo outra data ou o encaixe. Dia em que a empresa não funciona: informa que a empresa não funciona neste dia e sugere o encaixe.
- Mudando o profissional, a data ou o serviço, o horário escolhido é limpo (a menos que continue disponível).
- Ao salvar, não há dialog de confirmação. Se o profissional ou o cliente já tiverem agendamento no horário, o servidor recusa (conflito), e o dialog informa e atualiza os horários.
- Após salvar, um aviso informa o dia e o horário do agendamento (ex.: "Quinta-feira, 15 de outubro, das 09:00 às 10:00"). A agenda permanece no dia em que estava; não é levada ao dia do agendamento.

---

## Encaixar agendamento

### Estrutura do dialog

Segue a mesma estrutura de um novo agendamento.

### Regras específicas

- Seguir a mesma estrutura de regras de um novo agendamento, adicionando as novas regras para encaixe.
  - Este agendamento só deve acontecer em horários que a empresa não tem expediente e deve respeitar
    a regra de não agendar com data e horários no passado.
  - Um agendamento encaixado não pode ser oriundo de uma recorrência, apenas agendamentos pontuais.
  - A cor padrão de um agendamento encaixado deve ser cinza.
- O dialog exibe um aviso fixo de que o agendamento é fora do horário de funcionamento.
- Os horários oferecidos invertem a regra do novo agendamento: aparecem apenas horários em que o atendimento fica inteiro fora de qualquer janela de atendimento (inclusive o intervalo entre janelas), que ainda não passaram e que não sobrepõem outro agendamento do profissional. Horários dentro do expediente não aparecem.
- Os horários de início seguem a mesma grade do novo agendamento (de 15 em 15 minutos, mais o horário logo após o fim de cada janela e de cada agendamento do profissional), agrupados em períodos na mesma caixa de seleção.
- O atendimento não pode atravessar a meia-noite: precisa terminar até as 24:00 do mesmo dia.
- A duração do serviço escolhido é considerada para o horário final ("Término previsto").
- Dia em que a empresa não funciona, ou sem janela cadastrada, é permitido: o dia todo está fora do expediente.
- Sem horários disponíveis, o campo informa que não há horários fora do expediente no dia e sugere outra data.
- O horário clicado em uma área sombreada da agenda vem como "desejado", como no novo agendamento.
- Ao salvar, o agendamento é gravado como encaixe (`overBooking`). Conflito de horário do profissional ou do cliente é recusado pelo servidor e informado no dialog. Não há dialog de confirmação.
- Após salvar, um aviso informa o dia e o horário do encaixe, e a agenda permanece no dia em que estava.

---

## Alterar agendamento

### Estrutura do dialog

- Reaproveita o dialog de novo agendamento em modo de alteração, com o título "Alterar agendamento" e o botão "Salvar alterações".
- Todos os campos vêm preenchidos com os dados do agendamento: Cliente, Serviço, Profissional, Data, Horário (o horário atual já vem marcado) e Observações.
- Aberto pelo botão "Alterar" do dialog de detalhes do agendamento.

### O que pode ser alterado

- Agendamento ainda não iniciado (status Agendado ou Confirmado, com o horário de início no futuro): pode alterar cliente, serviço, profissional, data, horário e observações.
- Nada no passado é alterado: agendamento já iniciado, concluído, cancelado ou com status "Não compareceu" não pode ser alterado, nem as observações. O botão "Alterar" não é exibido.
- A restrição é da tela: o endpoint do backend continua aceitando mais formas de alteração (outras funcionalidades o usam), então a regra não é imposta lá.

### Regras específicas

- Seguem as regras do novo agendamento: a data não pode ser anterior a hoje, os horários são calculados pela disponibilidade do profissional na data para a duração do serviço (grade de 15 em 15 minutos mais o horário logo após o fim de cada agendamento), agrupados em períodos na caixa de seleção.
- O próprio horário do agendamento conta como livre para ele mesmo: pode permanecer no mesmo horário ou escolher outro.
- Mudando o profissional, a data ou o serviço, o horário escolhido é limpo, a menos que continue disponível.
- O tipo do agendamento é mantido:
  - Agendamento comum só pode ser remarcado para horários dentro do expediente (inteiro dentro de uma janela de atendimento).
  - Encaixe só pode ser remarcado para horários fora do expediente, com as regras do encaixe (inteiro fora das janelas, sem atravessar a meia-noite). A alteração do encaixe reenvia a autorização do encaixe (`overBooking`). O dialog exibe o aviso fixo de encaixe.
  - Para transformar um agendamento comum em encaixe, ou o contrário, cancela-se o agendamento e cria-se outro.
- Não pode ser remarcado para o passado.
- Limpar o campo Observações remove a observação.
- O botão "Salvar alterações" só fica habilitado quando algo foi alterado. Não há dialog de confirmação.
- Se o profissional ou o cliente já tiverem agendamento no novo horário, o servidor recusa (conflito), e o dialog informa e atualiza os horários.
- Agendamentos gerados por recorrência (funcionalidade futura) têm restrições na API (cliente, profissional, serviço e horário não mudam pela alteração comum); se a API recusar, o motivo é exibido no aviso de erro.
- Após salvar, um aviso informa o novo dia e horário (ex.: "Quinta-feira, 22 de outubro, das 10:00 às 11:00"). A agenda permanece no dia em que estava; se o agendamento foi para outro dia, o bloco deixa de aparecer nela e o aviso informa para onde foi.

---
