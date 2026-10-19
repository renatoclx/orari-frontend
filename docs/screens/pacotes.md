# Pacotes (Planos e Contratações)

> Um **plano** é um pacote de serviços, cada um com a quantidade de atendimentos
> por semana, um valor mensal e períodos de contratação (ex.: 3, 6 ou 12 meses),
> cada um com seus descontos. Uma **contratação** é um plano vendido a um cliente
> por um período, com a agenda de cada serviço e os pagamentos gerados de uma vez.

## Menu

- Dropdown **Pacotes** na sidebar, com **Planos** (`/pacotes/planos`) e **Contratações** (`/pacotes/contratacoes`).

---

# Planos

## Listagem

### Colunas

- Nome
- Serviços, com a frequência (ex.: "Pilates 2×/sem, Massagem 1×/sem")
- Valor mensal (BRL)
- Períodos (ex.: "3, 6 e 12 meses"; sem período: "--")
- Status (Ativo ou Inativo, conforme `isActive`)
- Ações
  - Alterar (em destaque)
  - Menu: Visualizar, Inativar ou Ativar

### Regras específicas

- Busca por nome e filtro de status, na URL; paginação como nas demais listagens.
- Botão "Novo plano".
- Não há exclusão: o plano é inativado (com confirmação) e pode ser reativado. Plano inativo não pode ser contratado; as contratações já feitas continuam valendo.

---

## Cadastro e alteração

Página própria (`/pacotes/planos/novo` e `/pacotes/planos/[id]/editar`), em duas colunas: dados do plano e períodos de contratação.

### Campos

- Nome (obrigatório, único na empresa).
- Serviços (obrigatório, ao menos um): seleção múltipla com busca, só serviços ativos, sem repetir. Cada serviço escolhido vira uma linha com o preço avulso (ou "sem preço"), os **atendimentos por semana** (1× a 7×; começa em 1×) e o botão de remover.
- Valor mensal (obrigatório, máscara BRL). É definido pela empresa e não depende dos preços dos serviços.
- Descrição (opcional).
- Períodos: lista de linhas, cada uma com:
  - Meses (inteiro, a partir de 1, sem repetir no plano);
  - Desconto no pagamento integral (%);
  - Desconto no pagamento mensal (%).
  - Botões para adicionar e remover período.

### Regras específicas

- **Valor sugerido:** preço avulso × atendimentos por semana × 4 semanas, somado para todos os serviços (serviço sem preço conta como R$ 0,00). O botão **Usar valor sugerido** preenche o valor mensal, que continua editável.
- Se o valor mensal for menor que o sugerido, a tela avisa, mas não impede salvar (a empresa pode fazer um valor promocional).
- Os percentuais vão de 0 a 100, com até duas casas decimais (vírgula ou ponto); os dois são obrigatórios em cada período.
- Cada período mostra uma prévia dos valores:
  - Integral: valor mensal × meses, com o desconto do integral ("R$ 1.080,00 à vista").
  - Mensal: parcela = valor mensal com o desconto do mensal; total = parcela × meses ("3 × R$ 380,00 = R$ 1.140,00").
  - Arredondamento de duas casas, metade para cima; no mensal, a parcela é arredondada antes do total. A prévia é só informativa: o servidor calcula os valores na contratação.
- Um plano pode ser salvo sem períodos, mas só pode ser contratado com ao menos um: a tela avisa.
- Na alteração, as listas de serviços e de períodos substituem as anteriores. Contratações já feitas não mudam (os valores e a frequência foram congelados).
- Serviço inativado depois aparece marcado como inativo e precisa sair para salvar; um plano com serviço inativo não pode ser contratado.
- Não há dialog de confirmação ao salvar; após salvar, um aviso e a volta para a listagem.

## Visualizar

- Dialog com a descrição, o valor mensal, os serviços com a frequência (e "inativo", se for o caso), o status e a tabela dos períodos com os descontos e os valores (integral à vista; mensal em parcelas e total).

---

# Contratações

## Listagem

### Colunas

- Cliente
- Plano
- Período (data de início a data final)
- Modalidade (Integral ou Mensal)
- Total (valor congelado na contratação)
- Status
  - **Ativa:** não cancelada e com o período ainda não terminado (inclui a que vai começar).
  - **Encerrada:** período terminado.
  - **Cancelada:** com data de cancelamento.
- Ações
  - Visualizar (abre os detalhes)
  - Cancelar contratação (só nas ativas)

### Regras específicas

- Filtros: cliente (com busca), plano e status, na URL; paginação como nas demais listagens. A ordem é da contratação mais recente para a mais antiga.
- Botão "Nova contratação".

---

## Nova contratação

Página própria (`/pacotes/contratacoes/nova`), em blocos na mesma tela.

### 1. Cliente e plano

- Cliente (seleção com busca no servidor; só do tipo Cliente).
- Plano (só planos ativos, com ao menos um período e com todos os serviços ativos). Abaixo, os serviços com a frequência.

### 2. Condições

- Período: os meses cadastrados no plano (já vem escolhido quando o plano tem um só).
- Modalidade: **Integral** (um pagamento com o total do período) ou **Mensal** (um pagamento por mês).
- Data de início: começa vazia (obrigatória); hoje ou futura, nunca passada. Abaixo do campo, o dia da semana (ex.: "terça-feira"): a primeira sessão é a do primeiro dia marcado a partir dela.
- Vencimento: no mensal, **primeiro vencimento**, obrigatório (as parcelas seguintes vencem no mesmo dia dos meses seguintes; se o dia não existir, vale o último dia do mês). No integral, opcional (vencimento do pagamento único).
- Data final: calculada e exibida (início + meses − 1 dia; ex.: 3 meses a partir de 15/10 terminam em 14/01).
- Resumo dos valores conforme a modalidade (valor mensal, desconto, parcela e total; sem modalidade, mostra as duas opções).
- **Comparativo com o avulso**, quando todas as agendas estão completas: quantidade de sessões no período, valor avulso (preço de cada serviço × sessões), valor do plano e a economia para o cliente. Se o plano sair mais caro que o avulso, o resumo avisa (sem impedir).

### 3. Agenda de cada serviço

- Um bloco por serviço do plano (exatamente os serviços do plano, nem mais nem menos), com:
  - Profissional;
  - Dias da semana: **exatamente** a quantidade de atendimentos por semana do plano. Ao atingir a quantidade, os outros dias ficam desabilitados; desmarcar um libera os demais. A tela não salva com dias a menos, e o servidor também recusa;
  - Os dias usam o mesmo campo das recorrências: ao marcar o dia, a linha mostra o período e os horários livres; o fim de cada sessão é o início mais a duração do serviço.
- O cabeçalho do bloco mostra os dias marcados ("1 de 2 dias por semana"), a quantidade de sessões no período e quando é a primeira (ex.: "primeira em segunda, 26/10").
- Sem cliente, profissional, plano, período e data de início, os blocos pedem que sejam escolhidos.
- **Horários livres no período inteiro:** um horário só é oferecido se estiver livre em **todas** as datas daquele dia da semana entre o início e o fim da contratação, e não só na primeira. Livre quer dizer: cabe inteiro na janela de atendimento do dia, não conflita com agendamento do profissional nem do cliente (cancelados não contam) e não está no passado.
- As sessões já escolhidas nos outros serviços da mesma contratação também contam como ocupadas para o cliente (ele não pode estar em dois atendimentos ao mesmo tempo). Trocar profissional, cliente, plano, período ou data de início limpa os horários escolhidos.
- O servidor confere tudo de novo ao salvar (tudo ou nada).

### Regras específicas

- Cada serviço gera uma recorrência própria, com o período da contratação. As sessões seguem as regras de agendamento: cabem inteiras em uma janela de atendimento e não conflitam com agendamento do profissional nem do cliente. Não há encaixe.
- A criação é tudo ou nada: contratação, agendas e pagamentos são gravados juntos. Se uma sessão conflitar, nada é gravado e a mensagem informa a data e o horário.
- Os valores e a frequência são congelados na contratação: mudar o plano ou os preços depois não altera a contratação.
- Após salvar, um aviso e a ida para os detalhes da contratação.

---

## Detalhes da contratação

- Dados e valores congelados: cliente, plano, período, modalidade, valor mensal com o desconto aplicado, total (no mensal, parcelas × valor), vencimento e, se cancelada, a data do cancelamento. Status ao lado do título.
- Agendas: uma linha por serviço, com o profissional, os dias e horários e o botão **Ver sessões**, que abre as sessões em **dialog** (sem sair da tela), com remanejar e cancelar sessão. A recorrência de pacote não é cancelada sozinha.
- Parcelas (só leitura): número, vencimento, valor e situação (Pendente, Atrasada, Paga, Cancelada). A baixa é feita no Financeiro.
- Ação **Cancelar contratação** (só nas ativas), com confirmação que explica o efeito:
  - as agendas são encerradas e as sessões futuras (agendadas ou confirmadas) são canceladas, liberando os horários;
  - no mensal, as parcelas pendentes que vencem a partir de hoje são canceladas; as atrasadas continuam pendentes e as pagas não mudam;
  - no integral, o pagamento não muda;
  - não há multa nem reembolso.
- Contratação cujo período já terminou não pode ser cancelada.

---

## Impacto em outras telas

- **Agendamentos:** a sessão de pacote tem o ícone de pacote (o mesmo do menu "Pacotes") no bloco, no cartão e no detalhe; a legenda tem o item "Pacote". No detalhe, **Ver sessões** (dialog de sessões) e **Ver contratação** (dialog com os dados, as agendas e as parcelas; de lá, "Ver sessões" troca para o dialog de sessões). O cancelamento da contratação fica só na página da contratação.
- **Recorrências:** as recorrências de pacote aparecem na lista, sem "Cancelar recorrência"; os detalhes mostram a origem "Pacote" (encerrada pelo cancelamento da contratação).

---

## Pendências

- Reposição por falta (sessão de pacote marcada como "Não compareceu" remanejada dentro do período): depois do MVP, junto com a ação de marcar a falta.
- Renovação: é uma nova contratação (não há tela própria).
- Troca de serviço durante a contratação: fora do MVP (o plano fecha o contrato).
