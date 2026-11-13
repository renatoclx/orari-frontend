# Decisões

Decisões do projeto que afetam o código, com a data e o porquê. Decisões de
interface (cores, tamanhos) estão na skill `.claude/skills/orari-ui/SKILL.md`;
regras de cada tela, em `docs/screens/`.

## Arquitetura e dados

- **2026-10-13 — Sessão em cookies `httpOnly`; só o servidor do Next fala com a API.** O navegador não lê o token (segurança) e não conhece o endereço do backend. A renovação fica no proxy, com requisições simultâneas compartilhando uma única renovação. Detalhes em `frontend-auth.md`.
- **2026-10-13 — Camadas: tela ou Server Action, `<assunto>.service.ts`, `apiFetch`, API.** Nenhuma tela chama o `apiFetch` direto; erros viram `ApiError`.
- **2026-10-13 — Tipos do domínio escritos à mão, espelhando o backend,** criados quando a tela precisa (o Swagger só descreve as entradas).
- **2026-10-14 — As três telas de pessoas são uma implementação** (`people-kinds`), parametrizada por tipo; Usuários é outra entidade (`UserType`) e não usa essas telas. _Por quê:_ clientes, funcionários e profissionais têm os mesmos campos e regras.
- **2026-10-14 — Exclusão de pessoa é inativação** (continua na lista como Inativo, com "Reativar"). _Por quê:_ o histórico (agendamentos, pagamentos) precisa continuar apontando para a pessoa.
- **2026-10-14 — Foto da pessoa enviada depois do cadastro,** por rota própria; se falhar, só avisa. O Next reescreve `/uploads` para a API e as Server Actions aceitam corpo de 3 MB.
- **2026-10-14 — Serviço só é excluído sem vínculos;** o backend responde 409 e a tela orienta a inativar.
- **2026-10-14 — Documentação por tela:** `docs/screens/` com um arquivo por tela. _Por quê:_ o `screens.md` único passou de 500 linhas e gerava conflitos de edição.

## Agenda

- **2026-10-15 — Expediente = janelas de atendimento cadastradas.** Fora do expediente é tudo que não cabe inteiro em uma janela: antes da abertura, depois do fechamento, dias sem janela e o intervalo entre janelas (o almoço não tem regra própria; a tela só o mostra em cinza).
- **2026-10-15 — Encaixe** é agendar fora do expediente: inteiro fora das janelas, sem atravessar a meia-noite, sem passado, sem recorrência; grava com `overBooking: true` e aparece em cinza exclusivo.
- **2026-10-15 — Horários do novo agendamento:** grade de 15 em 15 minutos mais o horário logo após o fim de cada agendamento (cobre o "horário quebrado"); o atendimento cabe inteiro em uma janela. Agrupados por período (manhã, tarde, noite) em uma caixa de seleção que só mostra os períodos com horário.
- **2026-10-15 — A disponibilidade é calculada no frontend** (janelas e agendamentos buscados por uma Server Action; a conta no navegador). _Por quê:_ evitar uma rota nova no backend e responder na hora ao trocar o serviço. O servidor decide ao salvar (conflito do cliente é recusado com 409).
- **2026-10-15 — Profissionais:** por padrão todos os ativos; filtro por profissional na URL (`?professional=`) e "Mostrar Todos" sempre visível; no celular, um profissional por vez. Inativos ficam fora (a agenda deles será remanejada, fora do MVP).
- **2026-10-16 — Status:** a única ação manual é cancelar, e só antes de iniciar (também imposta no backend). Início e conclusão são automáticos (job do backend); "Confirmado" será do cliente (futuro). "Alterar" também só antes de iniciar e mantém o tipo (comum ou encaixe). _Nada no passado é alterado._
- **2026-10-16 — Cancelados na grade** aparecem esmaecidos; se outro agendamento ocupa o horário, ou há vários cancelados iguais, aparece só um. _Por quê:_ evitar blocos sobrepostos.
- **2026-10-16 — Relógio vivo:** o "agora" da agenda anda sozinho e os dados são buscados de novo a cada minuto e ao voltar para a aba. _Por quê:_ sem isso, o botão de cancelar continuava aparecendo depois do início.

- **2026-10-17 — Remanejar** (agendamento comum e sessão de recorrência, exceto encaixe): botão ao lado de "Cancelar" no detalhe, dialog só com data e horário. O mesmo agendamento muda de data (não é recriado). _Por quê:_ o cliente costuma pedir outro dia em vez de cancelar, e cancelado é estado final.

## Recorrências

- **2026-10-16 — Tela própria (`/recorrencias`), com cadastro em página.** _Por quê:_ controle das recorrências separado da agenda; dias da semana e resumo das sessões não cabem num dialog.
- **2026-10-16 — Período máximo de 12 meses, definido no frontend** (constante `MAX_RECURRENCE_MONTHS`). O backend deixou de limitar a 60 dias.
- **2026-10-16 — Recorrência não é alterada:** só a observação muda; cancelar a recorrência cancela as sessões futuras. Sessões são canceladas ou remanejadas uma a uma, pela rota da recorrência.
- **2026-10-16 — Recorrências de pacote aparecem na lista, sem "Cancelar".** _Por quê:_ a API não filtra por pacote (filtrar na tela quebraria a paginação) e recusa o cancelamento (a contratação encerra a agenda).
- **2026-10-19 — Horários livres conferidos no período inteiro** (substitui "pela primeira ocorrência", de 2026-10-17): um horário só aparece se estiver livre em todas as datas do dia da semana, para o profissional e o cliente. Uma busca por período e a conta no navegador, sem rota nova. _Por quê:_ evitar o erro só no salvar; vale para recorrência e contratação.
- **2026-10-19 — A tela diz quando é a primeira sessão** (dia da semana da data inicial e "primeira em segunda, 26/10"). _Por quê:_ a data inicial não é o dia da primeira sessão, e isso confundia.
- **2026-10-16 — Origem na agenda:** sessões de recorrência têm o ícone de repetir ("Recorrente") e as de pacote, o de pacote ("Sessão de pacote", desde 2026-10-19), vindos de `recurringAppointment` na resposta do agendamento. A legenda mostra os dois.

## Pacotes

- **2026-10-19 — Plano com frequência por serviço** (atendimentos por semana, 1 a 7; backend: `PlanItem.sessionsPerWeek`). _Por quê:_ sem ela, o valor mensal não dizia quanto atendimento cobria.
- **2026-10-19 — Valor sugerido:** preço avulso × vezes por semana × **4 semanas**, somado; botão "Usar valor sugerido". Valor abaixo do sugerido só gera aviso (promoções). Serviço sem preço conta como zero.
- **2026-10-19 — Contratação com exatamente a frequência do plano** em dias da semana (tela e backend); ao atingir o limite, os outros dias ficam desabilitados.
- **2026-10-19 — Comparativo com o avulso na contratação** (sessões × preço × economia), só informativo.
- **2026-10-19 — Data de início da contratação começa vazia;** os horários consideram também as sessões dos outros serviços da mesma contratação.
- **2026-10-19 — Formulários de plano e contratação em página;** parcelas só leitura (a baixa é do Financeiro).
- **2026-10-19 — Reposição por falta (NO_SHOW) fica para depois do MVP.** _Revista em 2026-10-28: entrou (abaixo)._
- **2026-10-28 — A falta (NO_SHOW) não cobra e é definitiva; a reposição de sessão de pacote entra.** Premissa mantida: o sistema supõe que o cliente veio (os jobs concluem o atendimento e geram a cobrança), e a falta é a exceção que a recepção anota. Marcar a falta cancela o pagamento pendente, vale também depois de concluído, é recusada se o pagamento já foi recebido e não se desfaz; a sessão de pacote tem a reposição. Backend: `business-rules.md` (Agendamentos > Falta). Tela: botão "Marcar falta" e ação "Repor sessão".

## Usuários, métodos de pagamento e histórico do cliente

- **2026-10-19 — Reativar é uma rota própria** (`PATCH /:id/restore`) em usuários e métodos de pagamento; a listagem traz ativos e inativos. _Por quê:_ a inativação é lógica e o histórico continua apontando para o registro.
- **2026-10-19 — Nome do método de pagamento é único sem diferenciar maiúsculas nem acentos** ("PIX" e "Pix" são o mesmo), garantido no banco (índice no nome normalizado). Reativar com o nome em uso responde 409.
- **2026-10-19 — O usuário logado não se inativa nem muda o próprio tipo;** o ADMIN não atribui SUPER_ADMIN.
- **2026-10-19 — Histórico do cliente é uma página** (`/clientes/[id]`), só para clientes, também para o inativo (só consulta). _Por quê:_ tem abas e muita informação; um dialog perderia o filtro e a lista. Cancelados e não comparecidos aparecem no histórico.

## Financeiro

- **2026-10-22 — Duas telas, sem entidade nova:** **Pagamentos** (`/financeiro`, todas as cobranças, filtros e baixa) e **Comandas** (`/financeiro/comandas`, o fechamento do atendimento). _Por quê:_ a primeira ideia de comanda (pagamentos que vencem no dia) não era a do appBarber, que fecha um atendimento; uma comanda ligada a pagamentos deixava os atrasados e os pacotes sem onde cobrar.
- **2026-10-22 — A comanda nasce das visitas do dia** (cliente com atendimento hoje ou que pagou hoje) e traz também as pendências anteriores dele; sessão de pacote aparece como "Incluído no pacote" e o avulso não concluído, como "Aguardando conclusão". Cliente sem visita é cobrado em Pagamentos. Não compareceu não entra.
- **2026-10-22 — Os totais do resumo respeitam cliente e vencimento, não a situação,** e "Recebido" soma pelo vencimento. _Por quê:_ com um filtro de situação, os outros cartões zerariam; vencimento é o que une os três.
- **2026-10-22 — Baixa em lote só de um cliente,** tudo ou nada, com método ativo e data do pagamento (passada sim, futura não).
- **2026-10-22 — Parcelamento no cartão fica fora do MVP,** junto com taxas, valor líquido e repasse da operadora (conciliação). _Por quê:_ o parcelamento no cartão não muda a cobrança do cliente (está paga); só importa para o fluxo de caixa. Parcelar uma dívida interna é outro conceito (o pacote mensal já gera parcelas).

## Interface

- **2026-10-19 — Informação de outra tela abre em dialog, não em outra página** (sessões da contratação, sessões e contratação a partir da agenda). _Por quê:_ abrir outra página quebrava o fluxo e fazia o usuário perder o dia e o filtro da agenda.

- **2026-10-22 — Cartões de resumo são atalhos de filtro,** com ícone, faixa colorida à esquerda e fundo tingido quando ativos; clicar no ativo desfaz o filtro. No celular, quando os cartões filtram, a barra de filtros não aparece.
- **2026-10-17 — Todo botão com texto tem ícone à esquerda,** sempre o mesmo para a mesma ação (mapa na skill `orari-ui`). _Por quê:_ reconhecimento mais rápido da ação; antes era parcial.

## Acessibilidade e revisão de UX

- **2026-10-22 — A interface é verificada com `axe-core`** (todas as rotas, claro e escuro, computador e celular, mais diálogos e menus) e com a skill `web-design-guidelines` da Vercel, instalada no projeto. _Por quê:_ a Etapa 9 pedia uma revisão objetiva das telas prontas.
- **2026-10-22 — O azul do foco não muda,** mesmo com ~2,6:1 de contraste; é identidade visual e fica registrado na dívida técnica. As outras cores de texto cumprem 4,5:1 (tokens ajustados).
- **2026-10-22 — Esmaecido sem `opacity`:** concluído, cancelado e falta clareiam só o fundo e a faixa do bloco; o texto continua legível.
- **2026-10-22 — Nome acessível começa pelo texto visível,** e elemento clicável que não é `<button>` leva `role="button"` com Enter e Espaço.
- **2026-10-22 — Movimento reduzido é regra global;** a skill da Vercel foi adotada só nas regras que cabem no nosso padrão (Title Case nos botões, por exemplo, não vale em pt-BR).

## Configurações da empresa

- **2026-10-17 — Área própria (`/configuracoes`), acessada pelo menu do usuário,** com identidade (nome fantasia e logo), dados cadastrais só para leitura e horários de funcionamento, num formulário único. O backend ganhou `PATCH /companies/me`, `POST` e `DELETE /companies/me/logo` para o administrador; razão social, documento (CPF ou CNPJ), fuso e demais dados continuam só do SUPER_ADMIN.
- **2026-10-17 — Logo só em JPEG ou PNG** (a API não aceita SVG); aparece no header. Sem logo, ou se não carregar, nada aparece.
- **2026-10-17 — O tema claro/escuro foi para o menu do usuário,** liberando o espaço do header para a logo da empresa.
- **2026-10-17 — Horários gravados pela diferença com a API** (exclui, altera e cria só o necessário); não é uma transação única.

## Menu e próximos módulos

- **2026-10-17 — Financeiro vira dropdown** com Pagamentos e Métodos de pagamento (métodos de pagamento: implementação do responsável pelo projeto). **2026-10-22:** passou a ter também Comandas, na frente de Pagamentos.

## Usuários

- **2026-10-27 — O usuário se vincula a uma pessoa (profissional ou funcionário) pelo mesmo `peopleId`,** sem flag no banco; a "Função" da listagem mostra o cargo da pessoa, com a cor do tipo. _Por quê:_ ter ou não o vínculo é a informação (uma flag teria de ser mantida em sincronia). Só o profissional dá acesso à anamnese; o acesso do funcionário será tratado à parte.
- **2026-10-27 — Um profissional ou funcionário liga-se a no máximo um usuário ativo;** o 409 da API vai para o campo da pessoa.

## Anamnese

- **2026-10-28 — Modelos de ficha só para o ADMIN** (`/anamnese/modelos`; 404 para os demais), no mesmo formato de Planos: lista, página de cadastro e alteração e dialog de visualização. Descrição na segunda linha do nome.
- **2026-10-28 — Reordenar perguntas por arrastar e soltar com `@dnd-kit`** (mouse, toque e teclado, avisos em português). _Por quê:_ UX melhor que botões de subir e descer, e acessível.
- **2026-10-28 — A alteração só envia as perguntas quando mudaram,** porque a API cria uma versão nova a cada envio de `questions`. As fichas já abertas ficam na versão em que nasceram.
- **2026-10-28 — O menu "Anamnese" tem Fichas preenchidas, Modelos de ficha e Auditoria** para o ADMIN; o **profissional vinculado** vê só "Fichas preenchidas", direto no menu. As fichas também aparecem na aba "Anamnese" do cliente. _Por quê:_ ninguém deveria abrir o cliente, a aba e só então lançar uma ficha. (Substitui a decisão de 2026-10-28 de que o profissional não teria item de menu.)
- **2026-10-27 — Privacidade antes da conveniência:** nada de saúde em `localStorage`, `sessionStorage`, cookies, URL ou log; sem cache; rascunho só em memória; fichas e acompanhamentos imutáveis; erro mostra só o texto da API; o PDF vive só na memória da página (URL de blob revogada ao fechar).
- **2026-10-27 — A ficha é desenhada com as perguntas da versão em que nasceu,** nunca com a versão atual do modelo. As perguntas do modelo usam accordion (várias abertas), para a lista longa caber na tela e arrastar ficar fácil.
- **2026-10-27 — "Alterar" uma ficha é registrar um acompanhamento:** evolução em texto grande (obrigatória), só as respostas que mudaram, resposta dada não se apaga, e o campo **Agendamento relacionado** liga a anotação ao atendimento.
- **2026-10-27 — Tela "Fichas preenchidas"** (`/anamnese/fichas`) com clientes, quantidade de fichas, status e um dialog com as fichas de cada um; "Nova ficha" é botão nela, no dialog e na aba do cliente. Usa `GET /anamnesis/clients` (backend), porque contar cliente a cliente geraria uma auditoria por linha.
- **2026-10-27 — PDF por Route Handler:** a API exige o token no cabeçalho, então o servidor do Next lê o cookie httpOnly e entrega os bytes (`apiFetchBytes`). O histórico de acompanhamento é opcional (marcado por padrão).
- **2026-10-27 — Auditoria só do ADMIN, nomes resolvidos no servidor** (lista de usuários e uma busca por cliente da página); período como o dia inteiro no fuso da empresa.
- **2026-10-27 — "Sem acompanhamento" na agenda foi testado e removido** (no bloco e no cartão de hover): a maioria dos atendimentos aparecia sem acompanhamento e o aviso ficou dúbio. O endpoint `GET /anamnesis/appointments-with-entry` ficou no backend, sem uso.
- **2026-10-27 — Ids de fora são conferidos como UUID** antes de entrar no caminho da API (páginas dão 404; actions recusam; services usam `encodeURIComponent`).

## Acessos e limites por empresa

- **2026-11-04 — O SUPER_ADMIN libera, por empresa, o que os administradores enxergam** (matriz funcionalidade × Visualiza, Edita, Cria, Exclui/Inativa) **e limita profissionais e administradores,** pelo botão "Acessos e limites" da lista de Empresas. Só existem os tipos ADMIN e CLIENT. Os planos (Essencial, Profissional, Completo; nomes provisórios) são **modelos** que preenchem a matriz, ainda editáveis. _Por quê:_ vender o Orari em versões por tipo de negócio sem código diferente por plano.
- **2026-11-04 — A API barra; o frontend esconde.** O `access` vem em `GET /auth/me` e esconde menu, telas (404), botões e atalhos; a recusa de verdade é do backend (403 `FEATURE_NOT_IN_PLAN`). Sem `access` (API antiga), nada é escondido.
- **2026-11-04 — Funcionalidade nova nasce desmarcada;** empresa nova nasce com o modelo padrão (sem Anamnese e Turmas, 3 profissionais, 1 administrador). Agendamentos, Recorrências, Contratações, Comandas, Turmas e Anamnese exigem ver Clientes, Profissionais e Serviços.
- **2026-11-04 — Reativar usa a coluna Exclui/Inativa;** cancelar contratação ou recorrência também; alterar, cancelar e marcar falta de um agendamento usam Edita (a API usa PATCH).
- **2026-11-04 — Fonte hospedada no projeto** (`next/font/local`): o `next/font/google` falhava ao baixar no dev e caía na fonte do sistema.

## Empresas

- **2026-10-23 — Empresas é uma tela só do SUPER_ADMIN** (`/empresas`, item no fim do menu, 404 para os outros perfis), em lista com cadastro e alteração em dialog; empresas não são excluídas, são inativadas e reativadas. _Por quê:_ cadastrar empresa por chamada direta à API não dá para o dia a dia.
- **2026-10-23 — Fuso em lista curta (Brasil), com Brasília como padrão;** documento CPF ou CNPJ com a conferência dos dígitos na tela. A logo fica de fora (a API só troca a da própria empresa).
- **2026-10-23 — "Cadastrar administrador" abre logo depois do cadastro da empresa,** reaproveitando o dialog de Usuários com o tipo fixo e a empresa já definida: uma empresa nova não tem quem entre.

## Financeiro

- **2026-10-23 — O status da comanda tem quatro estados** (Aberta, Aguardando conclusão, Paga, Incluído no pacote), decididos no frontend a partir dos dados que a API já devolve. _Por quê:_ "nada pendente" não quer dizer "paga": o atendimento avulso só ganha cobrança quando é concluído, e a comanda de um atendimento futuro aparecia como Paga (bug visto em produção).

## Portal e app do cliente

- **2026-11-05 — O app do cliente é uma área própria (`/app`) do mesmo frontend,** com sessão separada da clínica. _Por quê:_ um deploy só, e as duas sessões convivem sem uma derrubar a outra.
- **2026-11-05 — O cliente tem conta única no Orari (telefone e senha) e busca estabelecimentos;** quem entra sozinho fica "não confirmado", com até 2 agendamentos futuros, até a clínica confirmar. O link da clínica liga a conta ao cadastro existente e o confirma. _Por quê:_ conhecer novos locais sem ligar a conta a um cadastro só porque o telefone é igual.
- **2026-11-05 — A interface do app segue o modelo do AppBarber como direção, não cópia:** tema escuro fixo, cor do Orari (ciano, com texto escuro por contraste), barra Início, Buscar, Agendamentos e Menu.
- **2026-11-05 — Portal do cliente tem entrada própria no menu** (a última antes de Ajuda), não uma seção em Configurações; o **Acesso ao portal** fica visível na coluna Ações da lista de Clientes. _Por quê:_ Configurações é só da empresa, e ação frequente não fica atrás de outro menu.
- **2026-11-05 — Em Meus dados o cliente altera o cadastro todo (inclusive a foto), copiado para cada clínica;** Pacotes e Recorrências são só consulta.

## Relatórios e Dashboard

- **2026-11-09 — Relatórios só do ADMIN, cada um com funcionalidade própria (só Visualiza),** marcados no modelo padrão. _Por quê:_ mostram faturamento; e a venda por versões precisa ligar e desligar cada um.
- **2026-11-09 — Toda impressão é uma rota própria `(print)/.../imprimir`,** em aba nova e tema claro, com a lista inteira. _Por quê:_ o `window.print` da tela pegaria o tema escuro, a sidebar e só a página atual da lista.
- **2026-11-10 — Menu Relatórios em um nível só;** ordem feita: Agendamentos, Rankings, Financeiro, Pacotes, Perfil do cliente e Dashboard.
- **2026-11-10 — Financeiro pela data do pagamento** (o que entrou no caixa); Rankings pelo atendimento concluído (o faturado); Análise de recebíveis pelo vencimento (o que falta). _Por quê:_ três perguntas diferentes sobre dinheiro, sem um relatório repetir o outro.
- **2026-11-10 — Dashboard é item próprio no topo da sidebar** (a agenda continua sendo a página inicial), só visual, e **sem API própria:** cada bloco usa a rota do relatório e segue a funcionalidade dele; as métricas comparam com o período anterior. _Por quê:_ o número do Dashboard é sempre o do relatório.
- **2026-11-10 — Cores categóricas `chart-cat-1..5`** para categorias sem ordem (métodos de pagamento), com a cor presa à entidade (ordem do cadastro), não à posição. _Por quê:_ verde e vermelho já dizem bom e ruim; e a cor não pode mudar quando o ranking muda.
- **2026-11-10 — Modelo de plano "Agenda"** (só agendamento, com o app do cliente) e relatórios por modelo; empresa nova continua com todos. Empresas de teste em produção são ajustadas à mão (sem migração). Distribuição a revisar.

## Contas a receber e a pagar

- **2026-11-10 — "Pagamentos" passa a se chamar Contas a receber** (menu e tela; rota e funcionalidade iguais), simétrico ao Contas a pagar; o relatório que se chamava "Contas a receber" vira **Análise de recebíveis** (rota `/relatorios/analise-de-recebiveis`). _Por quê:_ a tela operacional fica com o nome simples, e o relatório, que é análise, não disputa o nome.
- **2026-11-10 — Fornecedor é um tipo de pessoa** (`SUPPLIER`, os mesmos campos), que aceita **CPF ou CNPJ** e tem uma **categoria principal** opcional (pré-preenche a conta). _Por quê:_ reaproveita as telas de pessoas; o CNPJ só faz sentido nele.
- **2026-11-10 — Categorias de despesa cadastráveis**, com 9 iniciais em toda empresa. _Por quê:_ cada negócio tem as suas despesas.
- **2026-11-10 — Contas a pagar só do ADMIN; repetição só "parcelar" e "repetir por N meses"**, uma conta por mês. Valor pago diferente: **altera-se o valor antes de pagar**. Alterar e cancelar valem **só para a conta**; ficam as duas ações, **Cancelar** (histórico) e **Excluir** (lançamento errado; paga não). _Por quê:_ a forma mais simples que cobre o uso comum.
- **2026-11-10 — Comissão no Contas a pagar:** a comissão em aberto aparece como **linha calculada** por profissional (sem vencimento; soma no "A vencer") e se quita pelo **fechamento**. O fechamento (valor pago) e o **adiantamento** (que passou a pedir o método de pagamento) geram **contas pagas** na categoria Comissões, protegidas; desfazer o fechamento cancela a conta e excluir o adiantamento a apaga. Nada retroativo. _Por quê:_ cada saída de dinheiro entra no dia em que aconteceu, e a comissão continua tendo um lugar só para ser mexida.

## Comissão

- **2026-11-10 — Comissão por serviço** (percentual do valor cobrado ou valor fixo), gerada na conclusão do atendimento, também sem o cliente ter pago; cancelado não gera; nada retroativo (`commissionSince`). _Por quê:_ o roteiro de 2026-11-04 e "da implantação em diante".
- **2026-11-10 — Pacote: total contratado ÷ sessões geradas**, congelado (opção A). _Por quê:_ simples e não mexe no passado.
- **2026-11-10 — Só o ADMIN define e vê a comissão;** o profissional vinculado a um usuário ADMIN nasce **sem comissão** (o dono que atende). _Por quê:_ é remuneração, e o dono não recebe de si mesmo.
- **2026-11-10 — Adiantamento até o disponível;** pode ser excluído enquanto não fechado. **Fechamento** de tudo o que está em aberto até a data de corte, com método e data do pagamento, **recibo para assinar** (número sequencial, valor por extenso, detalhamento) e **desfazer só o último** (recibo cancelado, número não volta). _Por quê:_ fechar o mês é o uso comum; o recibo é o comprovante que o profissional assina.

## Produtos, estoque e venda

- **2026-11-11 — Produtos e categorias só do ADMIN**, três funcionalidades fora de todos os modelos (o SUPER_ADMIN libera): Categorias de produto, Produtos e Venda de produtos (que exige Comandas e Produtos). Grupo próprio no menu, abaixo de Serviços. _Por quê:_ é um módulo que nem toda clínica contrata.
- **2026-11-11 — Formulário de produto em página** (13 campos e foto), como Planos e Pessoas; categorias em dialog. _Por quê:_ o tamanho do formulário.
- **2026-11-11 — Estoque é o saldo das movimentações:** compra, uso interno, perda, ajuste (pelo saldo contado), venda e venda cancelada; o estoque atual só é informado no cadastro. Saldo negativo é recusado. A compra muda o preço de custo (**último custo**) e pode lançar a conta a pagar (**opcional**). _Por quê:_ histórico confiável e o custo sempre atualizado sem conta de média.
- **2026-11-11 — Venda na comanda já nesta fase:** vários itens e **um pagamento** (terceira origem do pagamento, sem criar a entidade Comanda); baixa o estoque **ao lançar**; valor sugerido = promocional (editável); **"Nova venda"** para quem só compra; cancela **só a pendente** (o estoque volta); o pagamento da venda é **protegido** (só a baixa pelo Contas a receber); **só o ADMIN vende**. _Por quê:_ cobre o balcão sem a reestruturação de uma comanda gravada.
- **2026-11-11 — A comanda continua sendo o dia do cliente.** A comanda paga não aceita produto (a compra seguinte é Nova venda e reabre a comanda do dia); o pago do dia fica num bloco recolhível "Recebidos". Gravar o fechamento da comanda no backend (comandas separadas no mesmo dia) foi avaliado e deixado de fora. _Por quê:_ resolve a leitura no balcão sem desestruturar o backend.

## App do profissional

- **2026-11-12 — O profissional usa o mesmo PWA (`/app`), com sessão e abas próprias,** em vez de um app novo. _Por quê:_ reaproveita a instalação, o visual, o login e a infraestrutura; o custo de manutenção é um só.
- **2026-11-12 — Entra pelo telefone, e o app tenta profissional antes de cliente,** com uma mensagem de erro única. _Por quê:_ é o que o profissional já usa no dia a dia e não revela se a conta existe; a ambiguidade (mesma pessoa, mesma senha) favorece o mais restrito.
- **2026-11-12 — O acesso é negado por padrão na API (`@ProfessionalApp()` + guard global).** _Por quê:_ havia 22 controllers sem `@Roles`, liberados a qualquer usuário logado; um perfil novo herdaria tudo. Lista exata fixada em teste.
- **2026-11-12 — Só consulta:** agenda, clientes, comissões e Início; sem alterar agendamentos, sem anamnese e sem status de pagamento dos clientes. Cliente só os dele (telefone sim; e-mail, CPF e endereço não).
- **2026-11-12 — Funcionalidade `professional-app` em todos os planos; `commissions` exigida para a aba Comissões.** O SUPER_ADMIN pode desligar cada uma por empresa.
- **2026-11-12 — Detalhes abrem no próprio cartão, não em diálogo,** e os avisos ficam na tela. _Por quê:_ as janelas da clínica ficam fora da área escura do app (mesma razão do app do cliente).
- **2026-11-12 — Listas de 10 por página (`?pagina=`), filtros na URL (`?q=`, `?dia=`, `?mes=`);** o recibo mostra os 10 primeiros atendimentos e "Ver todos", porque é um documento.
- **2026-11-12 — Gráfico da semana em CSS, sem biblioteca,** de segunda a domingo, uma série na cor primária; o que passou em cor cheia e o agendado em tom claro. _Por quê:_ é uma barra por dia; uma biblioteca pesaria no PWA.
- **2026-11-12 — A turma é um atendimento por sessão nas contagens (agenda, Início);** faltas e cancelados contam marcações.

## Notificações

- **2026-11-13 — Uma caixa por usuário, com sino e contador (marca vermelha),** no cabeçalho do painel e no topo do app do profissional. _Por quê:_ o push é o toque no ombro; o que fica gravado é o que vale, e o contador diz o que falta ler. Referência: Mercado Livre e redes sociais.
- **2026-11-13 — A caixa recebe tudo; só o push tem interruptor.** _Por quê:_ nada se perde, e o interruptor controla só a interrupção.
- **2026-11-13 — O push é genérico, sem o nome do cliente,** e a caixa leva os nomes. _Por quê:_ a tela bloqueada do celular é pública.
- **2026-11-13 — Contador por consulta a cada 30 segundos, ao voltar para a aba e ao ler** (evento da janela), sem tempo real. A notificação nova aparece também no **toaster do painel** (a conferência devolve a data da mais nova, e o painel compara com a que já viu).
- **2026-11-13 — Limpar notificações tira da lista e do contador, mas a linha fica** (`clearedAt`): a chave de deduplicação continua valendo e um evento repetido não volta a avisar. A confirmação é no próprio lugar, sem diálogo (vale no sino, no painel e no app). _Por quê:_ simples e confiável; SSE fica para depois.
- **2026-11-13 — O push só no app do profissional por enquanto;** o painel tem a caixa e o sino, sem service worker. _Por quê:_ o service worker do app já existe (escopo `/app/`); o do painel é um passo à parte.
- **2026-11-13 — Um único despachante no backend** para toda fonte de aviso (cliente no app, depois resumo do dia, boas-vindas, jobs; o WhatsApp entra como canal). _Por quê:_ quem avisa não precisa saber de canal.

## Qualidade e testes

- **2026-10-23 — Testes automáticos só de funções puras e de pontos de borda do servidor,** com Vitest (a mesma ferramenta do backend) e `arquivo.spec.ts` ao lado do código. _Por quê:_ é onde está a regra que quebra sem barulho (fuso, arredondamento, disponibilidade de horários); componentes e telas seguem verificados à mão e com `axe-core`. Ponta a ponta (Playwright) fica fora por ora.
- **2026-10-23 — CI do frontend** (`.github/workflows/ci.yml`): lint, tipos, testes e build, como no backend. Sem meta mínima de cobertura.
- **2026-10-23 — Teste que mostra bug não é ajustado para passar:** o bug é registrado e corrigido à parte. O primeiro ciclo (236 testes) não encontrou nenhum.

## Processo

- **2026-10-14 — Comentários:** todo código novo leva comentário curto explicando o porquê (regra herdada do backend).
- **2026-10-14 — Commits só com autorização** do responsável pelo projeto; as alterações ficam no working tree para revisão.
- **2026-10-13 — Documentação do projeto atualizada ao fechar cada módulo,** em uma revisão completa; a skill `orari-ui` é atualizada quando uma decisão de interface é aprovada.

## Em aberto

- Almoço como duas janelas; a tela de horário de funcionamento entra em Configurações da empresa. Pausas lançadas pelo administrador são futuras.
- Empresa sem nenhuma janela cadastrada: a API não restringe horários; falta definir o comportamento da agenda.
- Cliente que já tinha cadastro e entra sozinho pela busca do app fica com 2 cadastros; juntá-los fica para depois.
