# App do profissional

Mesmo PWA do cliente (`/app`); muda o que aparece conforme quem entrou. Só consulta.

## Entrar

- Pelo formulário de `/app/entrar`, com **telefone** e senha (veja [app-cliente.md](app-cliente.md)). O usuário é do tipo Profissional ([usuarios.md](usuarios.md)).
- Sessão em cookies próprios (`orari_app_pro`, `orari_app_pro_refresh`), nunca os da clínica; o proxy renova o acesso vencido. Uma sessão por vez: entrar como profissional encerra a de cliente, e o contrário também.
- O sistema web recusa esse usuário, e quem tenta abrir o painel é levado ao app.

## Navegação

- Barra de baixo com **Início**, **Agenda**, **Clientes**, **Comissões** (só se a clínica usa comissões no plano) e **Menu**. Rotas de cliente (Buscar, Agendamentos, página de estabelecimento, dados, avisos, pacotes) voltam ao Início.

## Início (`/app`)

- Saudação com o nome, a data, a clínica e o vínculo. Cadastro de profissional inativado: "Seu acesso está suspenso. Fale com a clínica." e nada mais. Os blocos, de cima para baixo (uma chamada só à API, `GET /professional-app/home`):
  1. **Hoje**: "N atendimentos" (ou "Dia livre") e quantos faltam; o **próximo** (horário, cliente ou "Turma", serviço) ou, se houver, o que está **em andamento**; botão **Agenda**.
  2. **Esta semana**: gráfico de barras (segunda a domingo) com o número sobre cada barra, o total da semana, legenda ("Já passou" em cor cheia, "Agendado" em tom claro) e o dia de hoje destacado. Cada barra leva à Agenda daquele dia. Feito em CSS, na cor primária, sem biblioteca; leitor de tela recebe a descrição em texto ("seg 9: 1; ter 10: 2…").
  3. **Mês**: Concluídos (com "+N que no mês anterior", só quando o mês anterior teve concluídos), Clientes atendidos, Faltas e Cancelados.
  4. **Comissão** (só se a clínica usa comissões e ele recebe): comissão do mês e a receber; leva a Comissões. Se a chamada falhar, o Início abre sem ele.
  5. **Próximos agendamentos**: os 3 seguintes depois de hoje, cada um com o dia, a hora e o cliente ou a turma; leva à Agenda do dia.
- Conta como na Agenda: a turma é um atendimento por sessão e o cancelado não entra. **Faltas e cancelados** contam marcações (cada aluno da turma é uma); **Clientes atendidos** são clientes distintos com atendimento concluído no mês.

## Agenda (`/app/agenda`)

- Lista do dia, só dos atendimentos dele (a API usa o vínculo do usuário). Cabeçalho com o dia por extenso ("Hoje", "Amanhã" ou "Ontem" quando for o caso), setas de dia anterior e próximo, o seletor de data do aparelho e o botão **Hoje** (só fora do dia atual). O dia vai na URL (`?dia=AAAA-MM-DD`); valor inválido vale como hoje. Resumo: "N atendimentos" (sem os cancelados) ou "Nenhum atendimento".
- Cada atendimento é um cartão: horário, cliente, serviço, cor do serviço na borda e o status (ícone e nome), como na agenda da clínica. Cancelado, falta e concluído ficam esmaecidos; cancelado com o nome riscado.
- **Turma:** um cartão por sessão ("Turma · 3/4", vagas ocupadas), com "Sessão cancelada" quando a clínica a cancelou. **Bloqueio** de horário da clínica: linha tracejada "Horário bloqueado".
- Tocar no cartão abre os detalhes **no próprio cartão** (as janelas de diálogo da clínica ficam fora da área escura do app): horário, serviço com duração e preço, origem (Encaixe, Pacote ou Recorrente) e observação; na turma, os alunos com a situação. Sem pagamento. Só consulta.
- Dia sem atendimentos: "Dia livre".

## Clientes (`/app/clientes`)

- Só os clientes dele: ativos, com ao menos um agendamento não cancelado com ele (a regra da Carteira de clientes). Ordem alfabética, busca pelo nome durante a digitação (`?q=`), 10 por página (`?pagina=`, com Anterior e Próxima; valor inválido vale 1) e a contagem ("12 clientes").
- Cada cartão: avatar (foto ou iniciais), nome, telefone e, em uma linha, o **próximo** agendamento ou, sem ele, o **último** atendimento concluído; sem nenhum dos dois, "Sem atendimento concluído". Toca e abre a ficha.
- Vazio: "Nenhum cliente ainda" (aparecem depois do primeiro agendamento) ou, na busca, "Nenhum cliente encontrado".

### Ficha do cliente (`/app/clientes/<id>`)

- Foto, nome e telefone formatado; os botões **Ligar** (`tel:`) e **WhatsApp** (`wa.me`) só quando o telefone tem DDD e número; sem telefone, "Sem telefone cadastrado".
- Último atendimento e próximo; abaixo, **Atendimentos**: os 50 mais recentes dele com esse cliente, do mais novo ao mais antigo, com data e hora, status (ícone e nome), serviço, duração e preço, selos de **Turma**, **Pacote**, **Recorrente** ou **Encaixe** e a observação. Cancelado e falta ficam esmaecidos.
- Sem pagamento, anamnese, e-mail, CPF nem endereço. Cliente que não é dele (ou id inválido): página "Não encontramos esta página", com "Voltar ao Início".

## Comissões (`/app/comissoes`)

- Só aparece (aba e telas) quando a empresa tem a funcionalidade `commissions`; sem ela, "não encontrado". Só consulta.
- Mês na URL (`?mes=AAAA-MM`; inválido vale o atual), com setas; não avança além do mês atual. O mês vale pela **data do atendimento**.
- **Comissão do mês** (valor e quantidade de atendimentos) e, abaixo, **Adiantado** e **A receber**: o que ainda não foi fechado, de todos os meses (a legenda explica).
- Lista do mês, 10 por página (`?pagina=`): cliente e valor, data e serviço, a regra ("40% de R$ 10,00" ou "Valor fixo", mais "Sessão de pacote") e o selo "Fechamento nº 0001" ou "Em aberto". Sem o que o cliente pagou. Mês vazio: "Nenhuma comissão neste mês".
- **Quem não recebe comissão** (ex.: o dono que atende): no lugar do resumo, "Você não recebe comissão".
- **Fechamentos** (`/app/comissoes/fechamentos`), 10 por página: "Recibo nº 0001", data e método do pagamento e o valor pago; o desfeito vem esmaecido com "Desfeito" (o número não volta). Vazio: "Nenhum fechamento ainda".
- **Recibo** (`/app/comissoes/fechamentos/<id>`): empresa e CPF/CNPJ, profissional, "Atendimentos até", pago em, comissões, adiantamentos, **valor pago**, os atendimentos (os 10 primeiros e **Ver todos os atendimentos**, que abre os demais; o recibo é um documento, não se divide em páginas) e os adiantamentos. Sem os nomes de quem fechou. O de outro profissional (ou id inválido): "não encontrado".

## Avisos e o sino (`/app/avisos`)

- **Sino só com o ícone** (sem moldura de botão), à direita, em todas as telas do app (só o profissional): no **Início** fica na linha da saudação ("Olá Camila"); nas demais, numa linha própria no topo. Leva a **Avisos** e mostra a **marca vermelha** do número de não lidas ("99+" a partir de 100; o nome acessível diz quantas). O número já vem certo na primeira tela e é conferido a cada minuto e ao voltar ao app. Leva a **Avisos**.
- **Avisos:** título, filtro **Todas** / **Não lidas (N)** (`?filtro=nao-lidas`), **Marcar todas como lidas** e a lista de 10 por página (`?pagina=`). Tocar num aviso marca como lida e abre o destino (ex.: a Agenda do dia do horário). Vazio: "Nenhum aviso ainda" ou "Nenhum aviso não lido: você está em dia".
- **Avisos neste aparelho** (card no fim): ativar e desativar o push **neste aparelho** (mesmos estados do app do cliente: instalar no iPhone, navegador sem suporte, bloqueado, desligado e ligado) e **um interruptor por categoria** do que também vira push (hoje: Agendamentos). A caixa recebe tudo; só o push tem interruptor. Sem a chave do push no servidor, o card avisa que os avisos no celular não estão disponíveis.
- **O que chega hoje:** o cliente marca ou cancela um horário **seu** pelo app. O texto da caixa tem os nomes; o do push é genérico ("Horário marcado para 16/11 às 08:00"), sem o nome do cliente.
- **Sair** limpa o aviso do aparelho na API antes de encerrar (se demorar mais de 3 s, sai mesmo assim), para quem entrar depois nele não receber o que é desta conta.

## Menu (`/app/menu`)

- Nome, telefone formatado e clínica; **Alterar senha** (senha atual, nova e confirmação; continua entrado, com aviso) e **Sair**.

## Pendências

- Link da Agenda para a ficha do cliente e o fechamento do módulo (docs transversais, manual e teste em escala).
