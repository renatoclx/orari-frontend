# Carteira de clientes

## Objetivo

Mostrar, por profissional, quais clientes ele atende, quem está frequente, quem
é novo e quem deixou de vir, e quanto essa carteira rendeu no período. Serve
para o ADMIN acompanhar a equipe e para o profissional saber quem procurar.

## Acesso

- Rota: `/relatorios/carteira-clientes`.
- Menu: grupo novo **Relatórios** (ícone de gráfico, depois do Financeiro), item
  "Carteira de clientes". Só o **ADMIN** (mostra o faturamento); a API também
  recusa os demais.
- Funcionalidade nova em Acessos e limites, só com a ação Visualiza:
  `client-portfolio` ("Carteira de clientes"). Nasce desmarcada (regra das
  funcionalidades novas); exige ver Clientes e Profissionais. Mais tarde fará
  parte de todos os planos.

## Regras

### Quem está na carteira

- Um cliente entra na carteira de um profissional quando tem **ao menos um
  agendamento não cancelado** com ele (avulso, recorrência, pacote ou turma).
- Não existe "profissional responsável" no cadastro: a carteira vem dos
  atendimentos. Um cliente pode estar na carteira de mais de um profissional.
- Clientes inativos ficam de fora.

### Situação do cliente na carteira

Calculada em relação ao profissional (não à empresa toda):

- **Novo**: o primeiro atendimento concluído com o profissional caiu no período
  filtrado.
- **Ativo**: tem atendimento concluído nos últimos **N dias** ou agendamento
  futuro com o profissional.
- **Sem retorno**: o último atendimento concluído tem mais de **N dias** e não há
  agendamento futuro.
- N = **60 dias**, igual para todas as empresas, sem configuração por enquanto.

### Valores

- **Faturado**: soma dos pagamentos dos atendimentos **concluídos** do
  profissional no período, divididos em **recebido** e **pendente**.
- **Ticket médio**: faturado ÷ atendimentos concluídos com pagamento próprio.
- Sessões de pacote não têm pagamento próprio (o pagamento é da contratação).
  Nesta etapa, contam só como **quantidade** ("Sessões de pacote"), sem valor.
  O rateio do pacote por sessão fica para a comissão (bloco 3).

## Layout

- Cabeçalho: título "Carteira de clientes" e descrição curta.
- Filtros (na URL): **Profissional** (só os ativos; começa no primeiro da
  lista), **Período** (de/até; padrão: mês atual; trocar uma data leva a outra
  junto), **Situação** e a busca por nome. No celular ficam só o profissional e
  a busca.
- Resumo em quatro cartões (padrão dos de Pagamentos): **Na carteira** (com os
  atendimentos concluídos no período e, se houver, quantos de pacote),
  **Novos**, **Sem retorno** (vermelho) e **Faturado** (verde: recebido,
  pendente e ticket médio). Os três primeiros filtram a lista pela situação;
  clicar no ativo desfaz.
- Gráficos, abaixo dos cartões (lado a lado no computador, um embaixo do outro
  no celular), com Recharts pelo componente `chart` do shadcn e cores pelos
  tokens (`success`, `destructive`, `chart-neutral`), validadas para
  daltonismo e contraste:
  - **Situação dos clientes**: barra segmentada (não rosca) com Novos, Ativos e
    Sem retorno; a legenda traz número e porcentagem e filtra a lista.
  - **Faturamento no período**: barras empilhadas de recebido e pendente por
    dia (até 62 dias) ou por semana; a dica mostra os valores e a quantidade de
    atendimentos (sem segundo eixo).
- Com os gráficos, a página rola como um painel; a lista tem altura mínima e
  rola por dentro.
- Lista de clientes do profissional, com busca por nome e filtro de situação
  (Todos, Ativos, Novos, Sem retorno):
  - Cliente (foto e nome);
  - Situação (selo: Novo `secondary`, Ativo `success`, Sem retorno
    `destructive`);
  - Último atendimento (data e serviço);
  - Próximo agendamento (data) ou vazio;
  - Atendimentos no período;
  - Pendente (valor em aberto do cliente com o profissional);
  - Ações: **Visualizar histórico** (`/clientes/[id]`) e, para quem tem
    celular, **WhatsApp** (abre a conversa pelo `wa.me`, sem envio pelo Orari).
- Ordem padrão: último atendimento, mais antigo primeiro (quem precisa de
  contato aparece em cima).
- Paginação como nas demais listas.

## Fora desta etapa

- Comparar profissionais lado a lado (ranking).
- Exportar a lista.
- Enviar mensagem pelo Orari aos clientes "Sem retorno" (fica com
  Mensagens/WhatsApp).
- Profissional vendo só a própria carteira (não há perfil de profissional com
  login; só ADMIN e CLIENT).

## API necessária (backend)

Rota nova de leitura, com `@Feature("client-portfolio")`:

- `GET /client-portfolio?professionalId=&from=&to=`: o resumo do período.
- `GET /client-portfolio/clients?professionalId=&from=&to=&status=&search=&page=`:
  a lista paginada com situação, último e próximo atendimento, quantidade no
  período e pendente.

Os cálculos ficam no backend (regra de negócio), no fuso da empresa.
